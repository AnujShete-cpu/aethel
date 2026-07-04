"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { CollectionIcon } from "@/components/collections/collection-icon";
import type { CollectionWithCount } from "@/services/collections";

type CollectionCardProps = {
  collection: CollectionWithCount;
  onEdit: (collection: CollectionWithCount) => void;
  onDelete: (collection: CollectionWithCount) => void;
};

export function CollectionCard({ collection, onEdit, onDelete }: CollectionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const formattedDate = new Date(collection.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="group relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80">
      <Link
        href={`/collections/${collection.id}` as Route}
        className="block focus-visible:outline-none"
      >
        <div className="flex items-start gap-3">
          <CollectionIcon name={collection.name} emoji={collection.emoji} color={collection.color} />
          <div className="min-w-0 flex-1 pr-8">
            <h3 className="truncate text-sm font-medium text-foreground">
              {collection.name}
            </h3>
            {collection.description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {collection.save_count} {collection.save_count === 1 ? "save" : "saves"}
          </span>
          <span>{formattedDate}</span>
        </div>
      </Link>

      {/* Quick actions */}
      <div className="absolute right-3 top-3" ref={menuRef}>
        <button
          type="button"
          aria-label={`More actions for ${collection.name}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
        >
          <MoreVertical className="size-3.5" aria-hidden="true" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-10 mt-1 w-36 rounded-md border border-border bg-card py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onEdit(collection);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onDelete(collection);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
