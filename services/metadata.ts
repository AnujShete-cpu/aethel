import * as cheerio from "cheerio";

export type UrlMetadata = {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
};

const FETCH_TIMEOUT_MS = 5000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2MB — enough for <head> of virtually any page
const USER_AGENT = "Mozilla/5.0 (compatible; AethelBot/1.0; +https://aethel.app)";

const EMPTY_METADATA: UrlMetadata = {
  title: null,
  description: null,
  image: null,
  siteName: null,
  favicon: null,
};

/**
 * Extracts page metadata (title, description, preview image, site name,
 * favicon) from a URL by fetching its HTML and reading standard <meta>
 * tags. This function never throws and never blocks save creation — any
 * failure (network error, timeout, non-HTML response, malformed URL)
 * resolves to an all-null metadata object rather than rejecting.
 *
 * Runs server-side only. Never call this from client code.
 */
export async function extractUrlMetadata(url: string): Promise<UrlMetadata> {
  const parsed = safeParseUrl(url);
  if (!parsed) {
    return EMPTY_METADATA;
  }

  const html = await fetchHtml(parsed);
  if (!html) {
    return EMPTY_METADATA;
  }

  try {
    return parseHtml(html, parsed);
  } catch (error) {
    // Parsing failures are logged server-side only — never surfaced to the
    // client, and never allowed to block the save from being created.
    console.error("[metadata] parseHtml error:", error);
    return EMPTY_METADATA;
  }
}

/**
 * Validates the URL is well-formed and restricted to http/https, guarding
 * against protocol smuggling (e.g. file://, javascript:) reaching fetch().
 */
function safeParseUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Fetches the URL with a bounded timeout and a response size cap.
 * Returns null on any failure — timeout, network error, non-2xx status,
 * or a non-HTML content type.
 */
async function fetchHtml(url: URL): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return null;
    }

    // Cap how much we read to avoid an unbounded response body.
    const reader = response.body?.getReader();
    if (!reader) {
      return await response.text();
    }

    const decoder = new TextDecoder();
    let result = "";
    let bytesRead = 0;

    while (bytesRead < MAX_RESPONSE_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      result += decoder.decode(value, { stream: true });
    }

    reader.cancel().catch(() => {});
    return result;
  } catch (error) {
    // Network errors, timeouts (AbortError), and DNS failures all land here.
    console.error("[metadata] fetchHtml error:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parses fetched HTML for standard metadata tags, falling back through
 * Open Graph, Twitter Card, and plain HTML equivalents in that order.
 */
function parseHtml(html: string, sourceUrl: URL): UrlMetadata {
  const $ = cheerio.load(html);

  const title =
    getMetaContent($, "og:title") ??
    getMetaContent($, "twitter:title") ??
    textOrNull($("title").first().text());

  const description =
    getMetaContent($, "og:description") ??
    getMetaContent($, "twitter:description") ??
    getMetaContent($, "description", "name");

  const image = resolveUrl(
    getMetaContent($, "og:image") ?? getMetaContent($, "twitter:image"),
    sourceUrl
  );

  const siteName = getMetaContent($, "og:site_name") ?? sourceUrl.hostname.replace(/^www\./, "");

  const favicon = resolveFavicon($, sourceUrl);

  return {
    title: truncate(title, 500),
    description: truncate(description, 2000),
    image,
    siteName: truncate(siteName, 255),
    favicon,
  };
}

function getMetaContent(
  $: cheerio.CheerioAPI,
  key: string,
  attr: "property" | "name" = "property"
): string | null {
  const value = $(`meta[${attr}="${key}"]`).attr("content");
  return textOrNull(value);
}

function resolveFavicon($: cheerio.CheerioAPI, sourceUrl: URL): string | null {
  const iconHref =
    $('link[rel="icon"]').attr("href") ??
    $('link[rel="shortcut icon"]').attr("href") ??
    $('link[rel="apple-touch-icon"]').attr("href");

  if (iconHref) {
    return resolveUrl(iconHref, sourceUrl);
  }

  // Fall back to the conventional /favicon.ico path if no <link> is present.
  return resolveUrl("/favicon.ico", sourceUrl);
}

/**
 * Resolves a possibly-relative URL (common for image/favicon paths)
 * against the source page's URL. Returns null for anything that still
 * fails to parse as an absolute http/https URL.
 */
function resolveUrl(value: string | null, base: URL): string | null {
  if (!value) return null;
  try {
    const resolved = new URL(value, base);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return null;
    }
    return resolved.toString();
  } catch {
    return null;
  }
}

function textOrNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function truncate(value: string | null, maxLength: number): string | null {
  if (!value) return null;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
