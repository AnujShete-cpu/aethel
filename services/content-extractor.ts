import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export type ContentExtractionResult = {
  success: boolean;
  contentText: string | null;
  wordCount: number;
  extractedAt: string | null;
};

const FETCH_TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5MB — article pages can be heavier than <head> alone
const MAX_STORED_CHARS = 50_000;
const USER_AGENT = "Mozilla/5.0 (compatible; AethelBot/1.0; +https://aethel.app)";

const FAILED_RESULT: ContentExtractionResult = {
  success: false,
  contentText: null,
  wordCount: 0,
  extractedAt: null,
};

/**
 * Extracts the readable article/page text from a URL using Mozilla's
 * Readability algorithm (the same engine behind Firefox Reader View) —
 * free, open-source, runs entirely server-side, no external API calls.
 *
 * This function never throws. Any failure — invalid URL, network error,
 * timeout, oversized response, non-HTML content, or a page Readability
 * can't parse into an article — resolves to a failed result rather than
 * rejecting. Content extraction must never block save creation.
 *
 * Extraction runs as a plain async function today, not a queued job, per
 * the current "no background workers yet" constraint. It is deliberately
 * kept as a single pure function with no side effects and no dependency
 * on request/response context, so it can be lifted into a background job
 * or queue worker later with no change to its signature or behavior.
 */
export async function extractPageContent(url: string): Promise<ContentExtractionResult> {
  const parsed = safeParseUrl(url);
  if (!parsed) {
    return FAILED_RESULT;
  }

  const html = await fetchHtml(parsed);
  if (!html) {
    return FAILED_RESULT;
  }

  try {
    return parseReadableContent(html, parsed);
  } catch (error) {
    // Parsing failures are logged server-side only — never surfaced to the
    // client, and never allowed to block the save from being created.
    console.error("[content-extractor] parseReadableContent error:", error);
    return FAILED_RESULT;
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
    console.error("[content-extractor] fetchHtml error:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Runs Mozilla's Readability algorithm against the fetched HTML (parsed
 * into a DOM via jsdom) to isolate the article/main content, stripping
 * navigation, ads, scripts, styles, cookie banners, and footer noise —
 * Readability's own heuristics handle this, the same way Firefox Reader
 * View does. The result is then whitespace-cleaned and safely truncated
 * to the storage limit.
 */
function parseReadableContent(html: string, sourceUrl: URL): ContentExtractionResult {
  const dom = new JSDOM(html, { url: sourceUrl.toString() });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.textContent) {
    return FAILED_RESULT;
  }

  const cleaned = cleanText(article.textContent);
  if (!cleaned) {
    return FAILED_RESULT;
  }

  const wordCount = countWords(cleaned);
  const truncated = truncateSafely(cleaned, MAX_STORED_CHARS);

  return {
    success: true,
    contentText: truncated,
    wordCount,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Collapses excessive whitespace, duplicate spaces, and empty lines left
 * behind after stripping HTML structure, without altering actual content.
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ") // collapse runs of spaces/tabs
    .replace(/\n{3,}/g, "\n\n") // collapse 3+ blank lines to a single blank line
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

/**
 * Word count is computed on the full cleaned text before truncation, so
 * it reflects the actual article length even when storage is capped.
 */
function countWords(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Truncates to the storage limit on a whitespace boundary where possible,
 * so stored content doesn't end mid-word.
 */
function truncateSafely(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > maxLength * 0.9 ? cut.slice(0, lastSpace) : cut;
}
