"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search, Plus, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { CollectionIcon } from "@/components/collections/collection-icon";
import { useCollections } from "@/hooks/use-collections";
import type { CollectionWithCount } from "@/services/collections";

type CollectionSelectorProps = {
  value: string | null;
  onChange: (collectionId: string | null) => void;
  onCreateNew?: () => void;
  disabled?: boolean;
};

export function CollectionSelector({
  value,
  onChange,
  onCreateNew,
  disabled,
}: CollectionSelectorProps) {
  const { data: collections } = useCollections();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const items = useMemo(() => collections ?? [], [collections]);
  const selected = items.find((c) => c.id === value) ?? null;

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((c) => c.name.toLowerCase().includes(q));
  }, [items, query]);

  function select(collection: CollectionWithCount | null) {
    onChange(collection ? collection.id : null);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex items-center gap-2 truncate">
          {selected ? (
            <>
              <CollectionIcon
                name={selected.name}
                emoji={selected.emoji}
                color={selected.color}
                size="sm"
              />
              {selected.name}
            </>
          ) : (
            <span className="text-muted-foreground">Unsorted</span>
          )}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-hidden rounded-md border border-border bg-card shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections..."
              autoFocus
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </div>

          <div className="max-h-48 overflow-y-auto py-1">
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              onClick={() => select(null)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
            >
              <span className="text-muted-foreground">Unsorted</span>
              {value === null && <Check className="size-3.5" aria-hidden="true" />}
            </button>

            {filtered.length === 0 && query.trim() ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No collections found.</p>
            ) : (
              filtered.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  role="option"
                  aria-selected={value === collection.id}
                  onClick={() => select(collection)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <CollectionIcon
                      name={collection.name}
                      emoji={collection.emoji}
                      color={collection.color}
                      size="sm"
                    />
                    <span className="truncate">{collection.name}</span>
                  </span>
                  {value === collection.id && (
                    <Check className="size-3.5 shrink-0" aria-hidden="true" />
                  )}
                </button>
              ))
            )}
          </div>

          {onCreateNew && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCreateNew();
              }}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              New collection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
