import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Search</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Find anything across your saved knowledge.
      </p>
      <p className="mt-6 text-sm font-medium text-muted-foreground">Coming Soon</p>
    </div>
  );
}
