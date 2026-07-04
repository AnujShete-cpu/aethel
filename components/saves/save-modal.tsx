"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSaveModal } from "@/providers/save-modal-provider";
import { CollectionSelector } from "@/components/collections/collection-selector";
import { CreateCollectionModal } from "@/components/collections/create-collection-modal";

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors";

type SaveModalProps = {
  onSaveSuccess: () => void;
};

export function SaveModal({ onSaveSuccess }: SaveModalProps) {
  const { isOpen, close } = useSaveModal();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Focus URL input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => urlInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setTitle("");
      setNotes("");
      setCollectionId(null);
      setFormState({ status: "idle" });
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setFormState({ status: "error", message: "URL is required." });
      urlInputRef.current?.focus();
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setFormState({
        status: "error",
        message: "Please enter a valid URL including https://",
      });
      urlInputRef.current?.focus();
      return;
    }

    setFormState({ status: "submitting" });

    try {
      const response = await fetch("/api/saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmedUrl,
          title: title.trim() || null,
          description: notes.trim() || null,
          collectionId,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setFormState({
          status: "error",
          message: (body as { error?: string }).error ?? "Something went wrong. Try again.",
        });
        return;
      }

      close();
      onSaveSuccess();
    } catch {
      setFormState({
        status: "error",
        message: "Network error. Please check your connection.",
      });
    }
  }

  const isSubmitting = formState.status === "submitting";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        aria-hidden="true"
        onClick={close}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-modal-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            id="save-modal-title"
            className="text-base font-semibold text-foreground"
          >
            Save
          </h2>
          <button
            type="button"
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={close}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {/* URL */}
          <div className="space-y-1.5">
            <label
              htmlFor="save-url"
              className="block text-sm font-medium text-foreground"
            >
              URL <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <input
              ref={urlInputRef}
              id="save-url"
              type="url"
              name="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (formState.status === "error") setFormState({ status: "idle" });
              }}
              className={cn(
                inputClass,
                formState.status === "error" && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isSubmitting}
              autoComplete="off"
              required
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="save-title"
              className="block text-sm font-medium text-foreground"
            >
              Title{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <input
              id="save-title"
              type="text"
              name="title"
              placeholder="Give it a name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              disabled={isSubmitting}
              maxLength={500}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label
              htmlFor="save-notes"
              className="block text-sm font-medium text-foreground"
            >
              Notes{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <textarea
              id="save-notes"
              name="notes"
              placeholder="Add a note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={cn(inputClass, "resize-none")}
              disabled={isSubmitting}
              maxLength={2000}
            />
          </div>

          {/* Collection */}
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-foreground">Collection</span>
            <CollectionSelector
              value={collectionId}
              onChange={setCollectionId}
              onCreateNew={() => setCreateCollectionOpen(true)}
              disabled={isSubmitting}
            />
          </div>

          {/* Error message */}
          {formState.status === "error" && (
            <p role="alert" className="text-sm text-destructive">
              {formState.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={close}
              disabled={isSubmitting}
              className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>

      <CreateCollectionModal
        isOpen={createCollectionOpen}
        onClose={() => setCreateCollectionOpen(false)}
        onCreated={(collection) => setCollectionId(collection.id)}
      />
    </>
  );
}
