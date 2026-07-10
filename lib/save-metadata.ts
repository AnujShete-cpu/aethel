import type { Database } from "@/types/supabase";

type Save = Database["public"]["Tables"]["saves"]["Row"];

/**
 * Shape of the data Aethel writes into the saves.metadata jsonb column.
 * This column is a general-purpose extension point (see the GIN index on
 * it) — these are the fields Phase 2.1 (URL metadata extraction) owns.
 * Future phases (AI tags, reading time, etc.) should add their own keys
 * here rather than repurposing these.
 *
 * This module has no server-only dependencies (no Supabase client, no
 * Clerk server SDK) so it is safe to import from both Server and Client
 * Components — notably SaveCard, which renders extracted preview data.
 */
export type SaveMetadata = {
  extractedDescription?: string | null;
  image?: string | null;
  siteName?: string | null;
  favicon?: string | null;
};

/**
 * Safely reads the extraction-related fields out of a save's metadata
 * jsonb column. Returns an all-null shape if metadata is empty, missing
 * expected keys, or not an object (defensive — the column is untyped
 * JSON at the database level).
 */
export function getSaveMetadata(save: Save): SaveMetadata {
  const raw = save.metadata;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const m = raw as Record<string, unknown>;
  return {
    extractedDescription:
      typeof m.extractedDescription === "string" ? m.extractedDescription : null,
    image: typeof m.image === "string" ? m.image : null,
    siteName: typeof m.siteName === "string" ? m.siteName : null,
    favicon: typeof m.favicon === "string" ? m.favicon : null,
  };
}
