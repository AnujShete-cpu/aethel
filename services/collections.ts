import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import type { Save } from "@/services/saves";

export type Collection = Database["public"]["Tables"]["collections"]["Row"];

export type CollectionWithCount = Collection & { save_count: number };

export type CreateCollectionInput = {
  name: string;
  description?: string | null;
  color?: string | null;
  emoji?: string | null;
};

export type UpdateCollectionInput = {
  name?: string;
  description?: string | null;
  color?: string | null;
  emoji?: string | null;
};

export type CollectionsResult =
  | { data: CollectionWithCount[]; error: null }
  | { data: null; error: string };

export type CollectionResult =
  | { data: Collection; error: null }
  | { data: null; error: string };

export type CollectionWithSavesResult =
  | { data: { collection: Collection; saves: Save[] }; error: null }
  | { data: null; error: string };

export type DeleteResult =
  | { error: null }
  | { error: string };

export type MoveSaveResult =
  | { error: null }
  | { error: string };

/**
 * Creates a new collection for the authenticated user.
 * user_id is always sourced from the server-side Clerk session —
 * never from client input.
 */
export async function createCollection(
  userId: string,
  input: CreateCollectionInput
): Promise<CollectionResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description ?? null,
      color: input.color ?? null,
      emoji: input.emoji ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[collections] createCollection error:", error);
    if (error.code === "23505") {
      return { data: null, error: "A collection with this name already exists." };
    }
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Returns all collections for the authenticated user with their save counts,
 * newest-updated first. RLS ensures users can only read their own rows.
 */
export async function getUserCollections(
  userId: string
): Promise<CollectionsResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("collections")
    .select(
  "*, save_collections!save_collections_collection_user_fk(count)"
)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[collections] getUserCollections error:", error);
    return { data: null, error: error.message };
  }

  const withCounts: CollectionWithCount[] = (data ?? []).map((row) => {
    const { save_collections, ...collection } = row as Collection & {
      save_collections: { count: number }[];
    };
    return {
      ...collection,
      save_count: save_collections?.[0]?.count ?? 0,
    };
  });

  return { data: withCounts, error: null };
}

/**
 * Returns a single collection and all saves currently linked to it.
 * RLS on both tables ensures users can only read their own data.
 */
export async function getCollectionWithSaves(
  userId: string,
  collectionId: string
): Promise<CollectionWithSavesResult> {
  const supabase = await createSupabaseServerClient();

  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .eq("user_id", userId)
    .single();

  if (collectionError) {
    console.error("[collections] getCollectionWithSaves collection error:", collectionError);
    if (collectionError.code === "PGRST116") {
      return { data: null, error: "Collection not found." };
    }
    return { data: null, error: collectionError.message };
  }

  const { data: links, error: linksError } = await supabase
    .from("save_collections")
    .select(
  "saves!save_collections_save_user_fk(*)"
)
    .eq("collection_id", collectionId)
    .eq("user_id", userId);

  if (linksError) {
    console.error("[collections] getCollectionWithSaves links error:", linksError);
    return { data: null, error: linksError.message };
  }

  const saves = ((links ?? []) as unknown as { saves: Save }[])
    .map((link) => link.saves)
    .filter((s): s is Save => s !== null)
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return { data: { collection, saves }, error: null };
}

/**
 * Updates a collection's editable fields.
 * The .eq("user_id", userId) clause provides application-layer defence in
 * addition to the RLS update policy.
 */
export async function updateCollection(
  userId: string,
  collectionId: string,
  input: UpdateCollectionInput
): Promise<CollectionResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("collections")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.emoji !== undefined ? { emoji: input.emoji } : {}),
    })
    .eq("id", collectionId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("[collections] updateCollection error:", error);
    if (error.code === "23505") {
      return { data: null, error: "A collection with this name already exists." };
    }
    if (error.code === "PGRST116") {
      return { data: null, error: "Collection not found." };
    }
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Deletes a collection. Saves that belonged to it are NOT deleted —
 * the save_collections rows linking them are removed via ON DELETE CASCADE
 * on the composite FK, which returns the saves to the unsorted state
 * (a save with no save_collections row is "unsorted" by definition).
 */
export async function deleteCollection(
  userId: string,
  collectionId: string
): Promise<DeleteResult> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", userId);

  if (error) {
    console.error("[collections] deleteCollection error:", error);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Moves a save into a collection, replacing any existing collection
 * membership for that save. A save belongs to at most one collection
 * at a time in the current UX, though the schema supports many-to-many.
 */
export async function moveSaveToCollection(
  userId: string,
  saveId: string,
  collectionId: string | null
): Promise<MoveSaveResult> {
  const supabase = await createSupabaseServerClient();

  // Remove any existing collection membership for this save first.
  const { error: deleteError } = await supabase
    .from("save_collections")
    .delete()
    .eq("save_id", saveId)
    .eq("user_id", userId);

  if (deleteError) {
    console.error("[collections] moveSaveToCollection delete error:", deleteError);
    return { error: deleteError.message };
  }

  // collectionId === null means "move to Unsorted" — no new link is created.
  if (collectionId === null) {
    return { error: null };
  }

  const { error: insertError } = await supabase.from("save_collections").insert({
    user_id: userId,
    save_id: saveId,
    collection_id: collectionId,
  });

  if (insertError) {
    console.error("[collections] moveSaveToCollection insert error:", insertError);
    return { error: insertError.message };
  }

  return { error: null };
}
