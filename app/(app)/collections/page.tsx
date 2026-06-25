import type { Metadata } from "next";

export const metadata: Metadata = { title: "Collections" };

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Collections</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Organise your saves into named collections.
      </p>
      <p className="mt-6 text-sm font-medium text-muted-foreground">Coming Soon</p>
    </div>
  );
}
