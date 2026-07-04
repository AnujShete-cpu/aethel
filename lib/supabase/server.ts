import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

import { env } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Returns a Supabase client scoped to the current Clerk user.
 *
 * Supabase's project now uses the JWT Signing Keys system (ECC P-256).
 * PostgREST verifies incoming tokens against the project's configured
 * key set, which no longer includes the legacy HS256 shared secret —
 * we never held the new private key, so the application cannot mint
 * Supabase-trusted tokens itself anymore.
 *
 * Instead, Clerk's own session token is passed straight through to
 * Supabase, which verifies it against Clerk's public JWKS via the
 * Third-Party Auth integration configured in the Supabase dashboard
 * (Authentication → Sign In / Providers → Third Party Auth → Clerk).
 * Clerk's session token carries a standard `sub` claim containing the
 * Clerk user ID, so requesting_user_id() and all existing RLS policies
 * continue to work unchanged.
 *
 * Falls back to the anon client when no session is present.
 */
export async function createSupabaseServerClient() {
  const { userId, getToken } = await auth();
 
  if (!userId) {
    return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
  }

  const token = await getToken();

 console.log("USER ID:", userId);
 console.log("TOKEN EXISTS:", !!token);
 console.log("TOKEN PREFIX:", token?.slice(0, 30));
  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    }
  });
}
