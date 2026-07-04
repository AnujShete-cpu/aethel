"use client";

import { useState } from "react";
import { Trash2, ExternalLink, FolderInput } from "lucide-react";

import type { Save } from "@/services/saves";

type SaveCardProps = {
  save: Save;
  onDelete: (id: string) => void;
  onMoveClick?: (save: Save) => void;
};

export function SaveCard({ save, onDelete, onMoveClick }: SaveCardProps) {
  const [deleting, setDeleting] = useState(false);

  const displayTitle = save.title ?? save.source_url ?? "Untitled";
  const formattedDate = new Date(save.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/saves/${save.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete(save.id);
      } else {
        console.error("Failed to delete save");
        setDeleting(false);
      }
    } catch {
      console.error("Network error deleting save");
      setDeleting(false);
    }
  }

  return (
    <article className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80">
      <div className="flex items-start justify-between gap-3">
        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-foreground">
            {displayTitle}
          </h3>

          {save.source_url && (
            <a
              href={save.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="max-w-xs truncate">{save.source_url}</span>
              <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
            </a>
          )}

          {save.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {save.description}
            </p>
          )}

          <p className="mt-2 text-xs text-muted-foreground/60">{formattedDate}</p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {onMoveClick && (
            <button
              type="button"
              aria-label={`Move ${displayTitle}`}
              onClick={() => onMoveClick(save)}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
            >
              <FolderInput className="size-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            aria-label={`Delete ${displayTitle}`}
            onClick={handleDelete}
            disabled={deleting}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
