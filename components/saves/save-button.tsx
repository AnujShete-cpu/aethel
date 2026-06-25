"use client";

import { Plus } from "lucide-react";

import { useSaveModal } from "@/providers/save-modal-provider";

type SaveButtonProps = {
  variant?: "default" | "mobile";
};

export function SaveButton({ variant = "default" }: SaveButtonProps) {
  const { open } = useSaveModal();

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={open}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="size-4 shrink-0" aria-hidden="true" />
        <span>Save</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Plus className="size-3.5" aria-hidden="true" />
      Save
    </button>
  );
}
