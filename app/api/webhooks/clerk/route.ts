import { headers } from "next/headers";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";
import type { WebhookEvent } from "@clerk/nextjs/server";

import type { Database } from "@/types/supabase";

/**
 * Service-role Supabase client for webhook use only.
 * RLS is bypassed intentionally — this runs server-to-server
 * with no user session present.
 */
function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false }
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerStore = await headers();
  const svixId = headerStore.get("svix-id");
  const svixTimestamp = headerStore.get("svix-timestamp");
  const svixSignature = headerStore.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix signature headers", { status: 400 });
  }

  const payload = await request.text();

  let event: WebhookEvent;

  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (event.type === "user.created") {
    const clerkUserId = event.data.id;
    const supabase = createSupabaseAdminClient();

    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert({ id: clerkUserId }, { onConflict: "id" });

    if (profileError) {
      console.error("Failed to create user_profile:", profileError);
      return new Response("Failed to create user profile", { status: 500 });
    }

    const { error: settingsError } = await supabase
      .from("user_settings")
      .upsert(
        { user_id: clerkUserId, timezone: "UTC", locale: "en" },
        { onConflict: "user_id" }
      );

    if (settingsError) {
      console.error("Failed to create user_settings:", settingsError);
      return new Response("Failed to create user settings", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}
