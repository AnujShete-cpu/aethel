"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Save } from "@/services/saves";
import { SaveCard } from "@/components/saves/save-card";
import { MoveSaveDialog } from "@/components/collections/move-save-dialog";
import { SearchNoResultsState } from "@/components/search/search-empty-state";
import { ErrorState } from "@/components/collections/error-state";
import { SavesListSkeleton } from "@/components/collections/skeletons";

type SearchResultsProps = {
  results: Save[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  searchQueryKey: readonly unknown[];
};

export function SearchResults({
  results,
  isLoading,
  isError,
  onRetry,
  searchQueryKey,
}: SearchResultsProps) {
  const queryClient = useQueryClient();
  const [moveTarget, setMoveTarget] = useState<Save | null>(null);

  function handleDelete(id: string) {
    queryClient.setQueryData<Save[]>(searchQueryKey, (old) =>
      old?.filter((s) => s.id !== id)
    );
  }

  if (isLoading) {
    return <SavesListSkeleton />;
  }

  if (isError) {
    return <ErrorState message="Couldn't complete your search." onRetry={onRetry} />;
  }

  if (!results || results.length === 0) {
    return <SearchNoResultsState />;
  }

  return (
    <>
      <ul className="space-y-3" role="list">
        {results.map((save) => (
          <li key={save.id}>
            <SaveCard save={save} onDelete={handleDelete} onMoveClick={setMoveTarget} />
          </li>
        ))}
      </ul>
      <MoveSaveDialog save={moveTarget} onClose={() => setMoveTarget(null)} />
    </>
  );
}
