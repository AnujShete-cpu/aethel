import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { SignJWT } from "jose";

import { env } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Signs a short-lived HS256 JWT that Supabase can verify using its own
 * JWT secret. The sub claim carries the Clerk user ID so that
 * requesting_user_id() in RLS policies resolves correctly.
 */
async function createSupabaseToken(clerkUserId: string): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET
  );

  return new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(clerkUserId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

/**
 * Returns a Supabase client scoped to the current Clerk user.
 * RLS policies enforce data ownership via requesting_user_id().
 * Falls back to the anon client when no session is present.
 */
export async function createSupabaseServerClient() {
  const { userId } = await auth();

  if (!userId) {
    return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
  }

  const token = await createSupabaseToken(userId);

  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}
