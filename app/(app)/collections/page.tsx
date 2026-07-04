import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Route } from "next";

import { getUserCollections } from "@/services/collections";
import { CollectionsGrid } from "@/components/collections/collections-grid";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login" as Route);
  }

  const result = await getUserCollections(userId);
  const collections = result.data ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <CollectionsGrid initialData={collections} />
    </div>
  );
}
