import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Save } from "@/services/saves";

export type SearchUserSavesInput = {
  query: string;
  collectionId?: string | null;
};

export type SearchResult =
  | { data: Save[]; error: null }
  | { data: null; error: string };

/**
 * Searches the authenticated user's saves by title, URL, or notes
 * (case-insensitive). Optionally scoped to a single collection, or to
 * saves with no collection at all ("Unsorted").
 *
 * userId is always sourced from the server-side Clerk session by the
 * caller (the API route) — never trusted from client input. RLS on the
 * saves and save_collections tables provides defence in depth on top of
 * the explicit .eq("user_id", userId) filters applied here.
 */
export async function searchUserSaves(
  userId: string,
  input: SearchUserSavesInput
): Promise<SearchResult> {
  const supabase = await createSupabaseServerClient();
  const term = input.query.trim();

  // "Unsorted" means: saves with no row in save_collections at all.
  // Resolve that set of save IDs first, then filter the main search to it.
  if (input.collectionId === "unsorted") {
    const { data: links, error: linksError } = await supabase
      .from("save_collections")
      .select("save_id")
      .eq("user_id", userId);

    if (linksError) {
      console.error("[search] searchUserSaves unsorted lookup error:", linksError);
      return { data: null, error: linksError.message };
    }

    const linkedSaveIds = (links ?? []).map((l) => l.save_id);

    let unsortedQuery = supabase
      .from("saves")
      .select("*")
      .eq("user_id", userId)
      .or(
        `title.ilike.%${escapeForIlike(term)}%,source_url.ilike.%${escapeForIlike(term)}%,description.ilike.%${escapeForIlike(term)}%`
      )
      .order("created_at", { ascending: false });

    // Exclude any save that has at least one collection link.
    if (linkedSaveIds.length > 0) {
      unsortedQuery = unsortedQuery.not(
        "id",
        "in",
        `(${linkedSaveIds.join(",")})`
      );
    }

    const { data, error } = await unsortedQuery;

    if (error) {
      console.error("[search] searchUserSaves unsorted search error:", error);
      return { data: null, error: error.message };
    }

    return { data: data ?? [], error: null };
  }

  // Scoped to a specific collection: only saves linked to it via save_collections.
  if (input.collectionId) {
    const { data: links, error: linksError } = await supabase
      .from("save_collections")
      .select("save_id")
      .eq("user_id", userId)
      .eq("collection_id", input.collectionId);

    if (linksError) {
      console.error("[search] searchUserSaves collection lookup error:", linksError);
      return { data: null, error: linksError.message };
    }

    const saveIds = (links ?? []).map((l) => l.save_id);

    if (saveIds.length === 0) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from("saves")
      .select("*")
      .eq("user_id", userId)
      .in("id", saveIds)
      .or(
        `title.ilike.%${escapeForIlike(term)}%,source_url.ilike.%${escapeForIlike(term)}%,description.ilike.%${escapeForIlike(term)}%`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[search] searchUserSaves collection search error:", error);
      return { data: null, error: error.message };
    }

    return { data: data ?? [], error: null };
  }

  // All collections: search every save owned by the user.
  const { data, error } = await supabase
    .from("saves")
    .select("*")
    .eq("user_id", userId)
    .or(
      `title.ilike.%${escapeForIlike(term)}%,source_url.ilike.%${escapeForIlike(term)}%,description.ilike.%${escapeForIlike(term)}%`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[search] searchUserSaves error:", error);
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

/**
 * Escapes characters with special meaning inside a PostgREST `.or()` filter
 * string and SQL LIKE wildcards, so user input can't alter the query
 * structure or produce unintended wildcard matches.
 */
function escapeForIlike(value: string): string {
  return value
    .replace(/[\\%_]/g, "\\$&") // escape LIKE wildcards and backslash
    .replace(/[(),]/g, "\\$&"); // escape PostgREST .or() filter delimiters
}
