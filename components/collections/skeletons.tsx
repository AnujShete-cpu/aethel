import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-accent/60", className)}
      aria-hidden="true"
    />
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Shimmer className="size-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-2/3" />
          <Shimmer className="h-3 w-1/2" />
        </div>
      </div>
      <Shimmer className="mt-4 h-3 w-1/3" />
    </div>
  );
}

export function CollectionsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading collections">
      {Array.from({ length: count }).map((_, i) => (
        <CollectionCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SaveCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="mt-2 h-3 w-1/2" />
      <Shimmer className="mt-3 h-3 w-1/4" />
    </div>
  );
}

export function SavesListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading saves">
      {Array.from({ length: count }).map((_, i) => (
        <SaveCardSkeleton key={i} />
      ))}
    </div>
  );
}
