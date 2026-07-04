"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { CollectionForm } from "@/components/collections/collection-form";
import { useCreateCollection } from "@/hooks/use-collections";
import { useToast } from "@/providers/toast-provider";
import type { Collection } from "@/services/collections";

type CreateCollectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (collection: Collection) => void;
};

export function CreateCollectionModal({
  isOpen,
  onClose,
  onCreated,
}: CreateCollectionModalProps) {
  const { mutateAsync, isPending, error, reset } = useCreateCollection();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(values: {
    name: string;
    description: string;
    emoji: string;
    color: string;
  }) {
    try {
      const collection = await mutateAsync({
        name: values.name,
        description: values.description || null,
        emoji: values.emoji || null,
        color: values.color || null,
      });
      showToast("Collection created");
      onCreated?.(collection);
      onClose();
    } catch {
      // error state surfaces via the form below
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-collection-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="create-collection-title" className="text-base font-semibold text-foreground">
            New collection
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5">
          <CollectionForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel="Create"
            isSubmitting={isPending}
            errorMessage={error?.message ?? null}
          />
        </div>
      </div>
    </>
  );
}
