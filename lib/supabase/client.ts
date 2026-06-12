import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Browser-side Supabase client for future use with real-time subscriptions
 * or client-side queries. All authenticated operations should use server
 * actions with createSupabaseServerClient instead.
 */
export function createSupabaseBrowserClient() {
  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}
