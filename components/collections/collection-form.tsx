"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // emerald
  "#06B6D4", // cyan
  "#64748B", // slate
] as const;

const EMOJI_PRESETS = [
  "📚",
  "🚀",
  "💻",
  "🧠",
  "⭐",
  "🔥",
  "📖",
  "🎯",
  "💡",
  "📝",
  "🗂️",
  "❤️",
] as const;

export type CollectionFormValues = {
  name: string;
  description: string;
  emoji: string;
  color: string;
};

type CollectionFormProps = {
  initialValues?: Partial<CollectionFormValues>;
  onSubmit: (values: CollectionFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string | null;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors";

function getSingleEmoji(value: string) {
  const emojiRegex = /\p{Extended_Pictographic}/u;
  const match = value.match(emojiRegex);

  return match ? match[0] : "";
}

export function CollectionForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
  errorMessage,
}: CollectionFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [emoji, setEmoji] = useState(initialValues?.emoji ?? "");
const [emojiOpen, setEmojiOpen] = useState(false);
  const [color, setColor] = useState(initialValues?.color ?? COLOR_PRESETS[0]);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError("Name is required.");
      return;
    }
    if (trimmedName.length > 160) {
      setValidationError("Name must be 160 characters or fewer.");
      return;
    }

    setValidationError(null);

    await onSubmit({
      name: trimmedName,
      description: description.trim(),
      emoji: emoji.trim(),
      color,
    });
  }

  const displayError = validationError ?? errorMessage;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Emoji + Name row */}
      <div className="flex gap-3">
        <div className="w-20 space-y-1.5">
          <label htmlFor="collection-emoji" className="block text-sm font-medium text-foreground">
            Icon
          </label>
          <div className="relative">
  <button
    id="collection-emoji"
    type="button"
    onClick={() => setEmojiOpen((open) => !open)}
    disabled={isSubmitting}
    className={cn(
      inputClass,
      "flex items-center justify-between text-lg"
    )}
  >
    <span>{emoji || "📚"}</span>
    <span className="text-xs text-muted-foreground">⌄</span>
  </button>

  {emojiOpen && (
    <div className="absolute z-50 mt-2 grid grid-cols-4 gap-2 rounded-md border bg-background p-2 shadow-md">
      {EMOJI_PRESETS.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setEmoji(item);
            setEmojiOpen(false);
          }}
          className="flex size-8 items-center justify-center rounded-md text-lg hover:bg-accent"
        >
          {item}
        </button>
      ))}
    </div>
  )}
</div>
        </div>
        <div className="flex-1 space-y-1.5">
          <label htmlFor="collection-name" className="block text-sm font-medium text-foreground">
            Name <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <input
            id="collection-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Reading List"
            maxLength={160}
            disabled={isSubmitting}
            required
            className={cn(
              inputClass,
              displayError && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="collection-description" className="block text-sm font-medium text-foreground">
          Description{" "}
          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="collection-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What belongs in this collection?"
          rows={2}
          maxLength={1000}
          disabled={isSubmitting}
          className={cn(inputClass, "resize-none")}
        />
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-foreground">Color</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Collection color">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              role="radio"
              aria-checked={color === preset}
              aria-label={`Color ${preset}`}
              onClick={() => setColor(preset)}
              disabled={isSubmitting}
              className={cn(
                "size-7 rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                color === preset && "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110"
              )}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {displayError && (
        <p role="alert" className="text-sm text-destructive">
          {displayError}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
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
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
