"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  Collection,
  CollectionWithCount,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/services/collections";
import type { Save } from "@/services/saves";

const collectionsKey = ["collections"] as const;
const collectionKey = (id: string) => ["collections", id] as const;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Request failed");
  }

  // 204 No Content has no body
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ----------------------------------------------------------------
// Queries
// ----------------------------------------------------------------

export function useCollections(initialData?: CollectionWithCount[]) {
  return useQuery({
    queryKey: collectionsKey,
    queryFn: () =>
      fetchJson<{ data: CollectionWithCount[] }>("/api/collections").then(
        (r) => r.data
      ),
    initialData,
  });
}

export function useCollection(
  id: string,
  initialData?: { collection: Collection; saves: Save[] }
) {
  return useQuery({
    queryKey: collectionKey(id),
    queryFn: () =>
      fetchJson<{ data: { collection: Collection; saves: Save[] } }>(
        `/api/collections/${id}`
      ).then((r) => r.data),
    initialData,
    enabled: Boolean(id),
  });
}

// ----------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCollectionInput) =>
      fetchJson<{ data: Collection }>("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionsKey });
    },
  });
}

export function useUpdateCollection(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCollectionInput) =>
      fetchJson<{ data: Collection }>(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => r.data),

    // Optimistic update: apply the edit immediately, roll back on failure.
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: collectionKey(id) });
      await queryClient.cancelQueries({ queryKey: collectionsKey });

      const previousDetail = queryClient.getQueryData(collectionKey(id));
      const previousList = queryClient.getQueryData(collectionsKey);

      queryClient.setQueryData(
        collectionKey(id),
        (old: { collection: Collection; saves: Save[] } | undefined) =>
          old
            ? { ...old, collection: { ...old.collection, ...input } }
            : old
      );

      queryClient.setQueryData(
        collectionsKey,
        (old: CollectionWithCount[] | undefined) =>
          old?.map((c) => (c.id === id ? { ...c, ...input } : c))
      );

      return { previousDetail, previousList };
    },
    onError: (_err, _input, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(collectionKey(id), context.previousDetail);
      }
      if (context?.previousList) {
        queryClient.setQueryData(collectionsKey, context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: collectionKey(id) });
      queryClient.invalidateQueries({ queryKey: collectionsKey });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<void>(`/api/collections/${id}`, { method: "DELETE" }),

    // Optimistic removal from the list.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: collectionsKey });
      const previousList = queryClient.getQueryData(collectionsKey);

      queryClient.setQueryData(
        collectionsKey,
        (old: CollectionWithCount[] | undefined) =>
          old?.filter((c) => c.id !== id)
      );

      return { previousList };
    },
    onError: (_err, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(collectionsKey, context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: collectionsKey });
    },
  });
}

export function useMoveSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      saveId,
      collectionId,
    }: {
      saveId: string;
      collectionId: string | null;
    }) =>
      fetchJson<{ data: { saveId: string; collectionId: string | null } }>(
        `/api/saves/${saveId}/collection`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectionId }),
        }
      ),
    onSuccess: () => {
      // Save counts and collection detail contents both change — invalidate broadly.
      queryClient.invalidateQueries({ queryKey: collectionsKey });
      queryClient.invalidateQueries({ queryKey: ["saves"] });
    },
  });
}
