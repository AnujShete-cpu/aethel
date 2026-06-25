import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Route } from "next";

import { getUserSaves } from "@/services/saves";
import { InboxList } from "@/components/saves/inbox-list";

export const metadata: Metadata = { title: "Inbox" };

export default async function InboxPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login" as Route);
  }

  const result = await getUserSaves(userId);
  const saves = result.data ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Inbox</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your saved knowledge.
        </p>
      </div>
      <InboxList initialSaves={saves} />
    </div>
  );
}
