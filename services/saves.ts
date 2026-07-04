import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export type Save = Database["public"]["Tables"]["saves"]["Row"];

export type CreateSaveInput = {
  url: string;
  title?: string | null;
  description?: string | null;
  collectionId?: string | null;
};

export type SavesResult =
  | { data: Save[]; error: null }
  | { data: null; error: string };

export type SaveResult =
  | { data: Save; error: null }
  | { data: null; error: string };

export type DeleteResult =
  | { error: null }
  | { error: string };

/**
 * Creates a new link save for the authenticated user.
 * user_id is always sourced from the server-side Clerk session —
 * never from client input.
 */
export async function createSave(
  userId: string,
  input: CreateSaveInput
): Promise<SaveResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("saves")
    .insert({
      user_id: userId,
      type: "link",
      source_url: input.url,
      title: input.title ?? null,
      description: input.description ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[saves] createSave error:", error);
    return { data: null, error: error.message };
  }

  if (input.collectionId) {
    const { error: linkError } = await supabase.from("save_collections").insert({
      user_id: userId,
      save_id: data.id,
      collection_id: input.collectionId,
    });

    if (linkError) {
      // The save itself was created successfully; the collection link failing
      // is logged but not treated as a fatal error for the save creation.
      console.error("[saves] createSave collection link error:", linkError);
    }
  }

  return { data, error: null };
}

/**
 * Returns all saves for the authenticated user, newest first.
 * RLS on the saves table ensures users can only read their own rows.
 */
export async function getUserSaves(userId: string): Promise<SavesResult> {
  // userId param is used for an explicit application-layer filter in addition
  // to RLS — defence in depth.
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("saves")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[saves] getUserSaves error:", error);
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}

/**
 * Deletes a save by ID.
 * The .eq("user_id", userId) clause provides application-layer defence in
 * addition to the RLS delete policy — a user can only delete their own rows.
 */
export async function deleteSave(
  userId: string,
  saveId: string
): Promise<DeleteResult> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("saves")
    .delete()
    .eq("id", saveId)
    .eq("user_id", userId);

  if (error) {
    console.error("[saves] deleteSave error:", error);
    return { error: error.message };
  }

  return { error: null };
}
