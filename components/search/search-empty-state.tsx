import { Search } from "lucide-react";

import { EmptyState } from "@/components/collections/empty-state";

export function SearchBeforeState() {
  return (
    <EmptyState
      title="Search your saved knowledge"
      description="Find saves by title, URL, or notes."
      action={
        <div
          className="flex size-10 items-center justify-center rounded-full bg-accent/60"
          aria-hidden="true"
        >
          <Search className="size-4 text-muted-foreground" />
        </div>
      }
    />
  );
}

export function SearchNoResultsState() {
  return (
    <EmptyState
      title="No matching saves found"
      description="Try a different search term or filter."
    />
  );
}
