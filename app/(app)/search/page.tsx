import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Route } from "next";

import { SearchView } from "@/components/search/search-view";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login" as Route);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Search</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Find anything across your saved knowledge.
        </p>
      </div>

      <SearchView />
    </div>
  );
}
