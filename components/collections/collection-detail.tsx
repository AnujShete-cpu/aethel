"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { CollectionIcon } from "@/components/collections/collection-icon";
import { EditCollectionModal } from "@/components/collections/edit-collection-modal";
import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog";
import { MoveSaveDialog } from "@/components/collections/move-save-dialog";
import { EmptyState } from "@/components/collections/empty-state";
import { ErrorState } from "@/components/collections/error-state";
import { SavesListSkeleton } from "@/components/collections/skeletons";
import { SaveCard } from "@/components/saves/save-card";
import { useCollection } from "@/hooks/use-collections";
import type { Collection } from "@/services/collections";
import type { Save } from "@/services/saves";

type CollectionDetailProps = {
  collectionId: string;
  initialData: { collection: Collection; saves: Save[] };
};

export function CollectionDetail({ collectionId, initialData }: CollectionDetailProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCollection(collectionId, initialData);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<Save | null>(null);
  const [localSaves, setLocalSaves] = useState(initialData.saves);

  if (isLoading && !data) {
    return <SavesListSkeleton />;
  }

  if (isError || !data) {
    return <ErrorState message="Couldn't load this collection." onRetry={() => refetch()} />;
  }

  const { collection } = data;
  const saves = data.saves ?? localSaves;
  const formattedDate = new Date(collection.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  function handleDeleteFromDetail(saveId: string) {
    setLocalSaves((prev) => prev.filter((s) => s.id !== saveId));
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <CollectionIcon
            name={collection.name}
            emoji={collection.emoji}
            color={collection.color}
            size="lg"
          />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{collection.name}</h1>
            {collection.description && (
              <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {saves.length} {saves.length === 1 ? "save" : "saves"} · Created {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Edit collection"
            onClick={() => setEditOpen(true)}
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Delete collection"
            onClick={() => setDeleteOpen(true)}
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Saves */}
      {saves.length === 0 ? (
        <EmptyState
          title="No saves in this collection"
          description="Move saves here from your Inbox, or save something new directly into this collection."
        />
      ) : (
        <ul className="space-y-3" role="list">
          {saves.map((save) => (
            <li key={save.id}>
              <SaveCard save={save} onDelete={handleDeleteFromDetail} onMoveClick={setMoveTarget} />
            </li>
          ))}
        </ul>
      )}

      <EditCollectionModal collection={editOpen ? collection : null} onClose={() => setEditOpen(false)} />
      <DeleteCollectionDialog
        collection={deleteOpen ? collection : null}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => router.push("/collections")}
      />
      <MoveSaveDialog save={moveTarget} onClose={() => setMoveTarget(null)} onMoved={() => refetch()} />
    </>
  );
}
