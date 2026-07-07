"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Save } from "@/services/saves";

const SEARCH_DEBOUNCE_MS = 300;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

/**
 * Debounces a value, only updating the returned value after `delay` ms
 * have passed without the input changing again.
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export type UseSearchOptions = {
  query: string;
  collectionId?: string | null;
};

/**
 * Debounces the query and only fires the search request once the user
 * has paused typing, avoiding request spam on every keystroke. Results
 * are cached per (query, collectionId) pair by React Query.
 */
export function useSearch({ query, collectionId }: UseSearchOptions) {
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const queryKey = ["search", debouncedQuery, collectionId ?? "all"] as const;

  const queryResult = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({ q: debouncedQuery });
      if (collectionId) {
        params.set("collection", collectionId);
      }
      return fetchJson<{ results: Save[] }>(`/api/search?${params.toString()}`).then(
        (r) => r.results
      );
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 30_000,
  });

  return {
    ...queryResult,
    queryKey,
    // Distinguishes "user hasn't searched yet" from "search returned zero results".
    hasSearched: debouncedQuery.length > 0,
    isDebouncing: query.trim() !== debouncedQuery,
  };
}
