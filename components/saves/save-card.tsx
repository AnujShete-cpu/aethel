"use client";

import { useState } from "react";
import { Trash2, ExternalLink, FolderInput } from "lucide-react";

import type { Save } from "@/services/saves";
import { getSaveMetadata } from "@/lib/save-metadata";

type SaveCardProps = {
  save: Save;
  onDelete: (id: string) => void;
  onMoveClick?: (save: Save) => void;
};

export function SaveCard({ save, onDelete, onMoveClick }: SaveCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);

  const meta = getSaveMetadata(save);
  const displayTitle = save.title ?? save.source_url ?? "Untitled";
  const domain = getDomain(save.source_url);
  const displayDescription = save.description ?? meta.extractedDescription;
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
              className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {meta.favicon && !faviconFailed && (
                // eslint-disable-next-line @next/next/no-img-element -- external favicon, arbitrary domain, not eligible for next/image optimization
                <img
                  src={meta.favicon}
                  alt=""
                  width={14}
                  height={14}
                  className="size-3.5 shrink-0 rounded-sm"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setFaviconFailed(true)}
                />
              )}
              <span className="max-w-xs truncate">{domain ?? save.source_url}</span>
              <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
            </a>
          )}

          {displayDescription && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {displayDescription}
            </p>
          )}

          <p className="mt-2 text-xs text-muted-foreground/60">{formattedDate}</p>
        </div>

        {/* Preview image */}
        {meta.image && !imageFailed && (
          // eslint-disable-next-line @next/next/no-img-element -- external preview image, arbitrary domain, not eligible for next/image optimization
          <img
            src={meta.image}
            alt=""
            className="h-16 w-24 shrink-0 rounded-md border border-border object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        )}

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

function getDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
