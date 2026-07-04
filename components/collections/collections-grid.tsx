"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { CollectionCard } from "@/components/collections/collection-card";
import { CreateCollectionModal } from "@/components/collections/create-collection-modal";
import { EditCollectionModal } from "@/components/collections/edit-collection-modal";
import { DeleteCollectionDialog } from "@/components/collections/delete-collection-dialog";
import { CollectionsGridSkeleton } from "@/components/collections/skeletons";
import { EmptyState } from "@/components/collections/empty-state";
import { ErrorState } from "@/components/collections/error-state";
import { useCollections } from "@/hooks/use-collections";
import type { Collection, CollectionWithCount } from "@/services/collections";

type CollectionsGridProps = {
  initialData: CollectionWithCount[];
};

export function CollectionsGrid({ initialData }: CollectionsGridProps) {
  const { data: collections, isLoading, isError, refetch } = useCollections(initialData);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  if (isLoading && !collections) {
    return <CollectionsGridSkeleton />;
  }

  if (isError) {
    return <ErrorState message="Couldn't load your collections." onRetry={() => refetch()} />;
  }

  const items = collections ?? [];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Collections</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Organise your saves into named collections.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-4" aria-hidden="true" />
          New collection
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No collections yet"
          description="Create your first collection to start organising your saves."
          action={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
              New collection
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CreateCollectionModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      <EditCollectionModal collection={editTarget} onClose={() => setEditTarget(null)} />
      <DeleteCollectionDialog collection={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </>
  );
}
