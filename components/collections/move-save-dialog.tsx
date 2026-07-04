"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { CollectionSelector } from "@/components/collections/collection-selector";
import { useMoveSave } from "@/hooks/use-collections";
import { useToast } from "@/providers/toast-provider";
import type { Save } from "@/services/saves";

type MoveSaveDialogProps = {
  save: Save | null;
  onClose: () => void;
  onMoved?: () => void;
};

export function MoveSaveDialog({ save, onClose, onMoved }: MoveSaveDialogProps) {
  const isOpen = save !== null;
  const [selected, setSelected] = useState<string | null>(null);
  const { mutateAsync, isPending } = useMoveSave();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!save) return null;

  async function handleConfirm() {
    if (!save) return;
    try {
      await mutateAsync({ saveId: save.id, collectionId: selected });
      showToast("Save moved");
      onMoved?.();
      onClose();
    } catch {
      showToast("Failed to move save", "error");
    }
  }

  const displayTitle = save.title ?? save.source_url ?? "this save";

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-save-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="move-save-title" className="truncate text-base font-semibold text-foreground">
            Move &ldquo;{displayTitle}&rdquo;
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-2 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5">
          <CollectionSelector value={selected} onChange={setSelected} disabled={isPending} />
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
            onClick={handleConfirm}
            disabled={isPending}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Moving..." : "Move"}
          </button>
        </div>
      </div>
    </>
  );
}
