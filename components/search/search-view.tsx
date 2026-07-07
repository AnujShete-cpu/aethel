"use client";

import { useState } from "react";

import { SearchInput } from "@/components/search/search-input";
import { SearchFilters } from "@/components/search/search-filters";
import type { CollectionFilterValue } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { SearchBeforeState } from "@/components/search/search-empty-state";
import { useSearch } from "@/hooks/use-search";

export function SearchView() {
  const [query, setQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilterValue>("all");

  const collectionId = collectionFilter === "all" ? null : collectionFilter;

  const { data, isLoading, isError, hasSearched, queryKey, refetch } = useSearch({
    query,
    collectionId,
  });

  return (
    <>
      <div className="space-y-4">
        <SearchInput value={query} onChange={setQuery} />
        <SearchFilters
          collectionFilter={collectionFilter}
          onCollectionFilterChange={setCollectionFilter}
        />
      </div>

      <div className="mt-6">
        {!hasSearched ? (
          <SearchBeforeState />
        ) : (
          <SearchResults
            results={data}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            searchQueryKey={queryKey}
          />
        )}
      </div>
    </>
  );
}
