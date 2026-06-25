"use client";

import { useState, useEffect } from "react";

import type { Save } from "@/services/saves";
import { SaveCard } from "@/components/saves/save-card";
import { SaveModal } from "@/components/saves/save-modal";
import { useSaveModal } from "@/providers/save-modal-provider";

type InboxListProps = {
  initialSaves: Save[];
};

export function InboxList({ initialSaves }: InboxListProps) {
  const [saves, setSaves] = useState<Save[]>(initialSaves);
  const { isOpen } = useSaveModal();

  // Re-fetch saves from server after modal closes following a successful save.
  // Using a simple flag: when modal closes, refresh if we might have new data.
  const [shouldRefresh, setShouldRefresh] = useState(false);

  function handleSaveSuccess() {
    setShouldRefresh(true);
  }

  useEffect(() => {
    if (!isOpen && shouldRefresh) {
      setShouldRefresh(false);
      fetch("/api/saves")
        .then((r) => r.json())
        .then((body: { data?: Save[] }) => {
          if (body.data) setSaves(body.data);
        })
        .catch(() => {
          // Silently fail — the existing list remains visible
        });
    }
  }, [isOpen, shouldRefresh]);

  function handleDelete(id: string) {
    setSaves((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <>
      <SaveModal onSaveSuccess={handleSaveSuccess} />

      {saves.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3" role="list">
          {saves.map((save) => (
            <li key={save.id}>
              <SaveCard save={save} onDelete={handleDelete} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function EmptyState() {
  const { open } = useSaveModal();

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <p className="text-sm font-medium text-foreground">No saves yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Click{" "}
        <button
          type="button"
          onClick={open}
          className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
        >
          Save
        </button>{" "}
        to add your first item.
      </p>
    </div>
  );
}
