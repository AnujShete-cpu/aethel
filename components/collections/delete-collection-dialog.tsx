"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { useDeleteCollection } from "@/hooks/use-collections";
import { useToast } from "@/providers/toast-provider";
import type { Collection } from "@/services/collections";

type DeleteCollectionDialogProps = {
  collection: Collection | null;
  onClose: () => void;
  onDeleted?: () => void;
};

export function DeleteCollectionDialog({
  collection,
  onClose,
  onDeleted,
}: DeleteCollectionDialogProps) {
  const isOpen = collection !== null;
  const { mutateAsync, isPending } = useDeleteCollection();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!collection) return null;

  async function handleDelete() {
    if (!collection) return;
    try {
      await mutateAsync(collection.id);
      showToast("Collection deleted");
      onDeleted?.();
      onClose();
    } catch {
      showToast("Failed to delete collection", "error");
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-collection-title"
        aria-describedby="delete-collection-description"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
          </div>
          <div>
            <h2 id="delete-collection-title" className="text-base font-semibold text-foreground">
              Delete &ldquo;{collection.name}&rdquo;?
            </h2>
            <p id="delete-collection-description" className="mt-1.5 text-sm text-muted-foreground">
              This collection will be deleted. Saves inside it will not be
              deleted — they&apos;ll move to Unsorted.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            autoFocus
            className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </>
  );
}
