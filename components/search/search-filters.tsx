"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { useCollections } from "@/hooks/use-collections";

/**
 * "all" searches every save. "unsorted" searches only saves with no
 * collection link. Any other value is a collection ID. This shape is
 * intentionally a single field today; future filters (content type,
 * date range, AI tags) should be added as sibling fields on a shared
 * SearchFilters type rather than folded into this one, so each filter
 * can evolve its own UI and query param independently.
 */
export type CollectionFilterValue = "all" | "unsorted" | string;

type SearchFiltersProps = {
  collectionFilter: CollectionFilterValue;
  onCollectionFilterChange: (value: CollectionFilterValue) => void;
};

export function SearchFilters({
  collectionFilter,
  onCollectionFilterChange,
}: SearchFiltersProps) {
  const { data: collections } = useCollections();
  const items = useMemo(() => collections ?? [], [collections]);

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by collection">
      <FilterChip
        label="All Collections"
        isActive={collectionFilter === "all"}
        onClick={() => onCollectionFilterChange("all")}
      />
      <FilterChip
        label="Unsorted"
        isActive={collectionFilter === "unsorted"}
        onClick={() => onCollectionFilterChange("unsorted")}
      />
      {items.map((collection) => (
        <FilterChip
          key={collection.id}
          label={collection.name}
          icon={
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: collection.color ?? "#6366F1" }}
              aria-hidden="true"
            />
          }
          isActive={collectionFilter === collection.id}
          onClick={() => onCollectionFilterChange(collection.id)}
        />
      ))}
    </div>
  );
}

type FilterChipProps = {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
};

function FilterChip({ label, icon, isActive, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
