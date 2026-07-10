"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#06B6D4",
  "#64748B",
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

export function CollectionForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
  errorMessage,
}: CollectionFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );
  const [emoji, setEmoji] = useState(initialValues?.emoji ?? "");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [color, setColor] = useState(
    initialValues?.color ?? COLOR_PRESETS[0]
  );
  const [validationError, setValidationError] =
    useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setValidationError("Name is required.");
      return;
    }

    setValidationError(null);

    await onSubmit({
      name: trimmedName,
      description: description.trim(),
      emoji,
      color,
    });
  }

  const displayError = validationError ?? errorMessage;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      <div className="flex gap-3">

        <div className="w-20 space-y-1.5">
          <label
            htmlFor="collection-emoji"
            className="block text-sm font-medium text-foreground"
          >
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
              <span className="text-sm font-bold text-foreground">
                ⌄
              </span>
            </button>

            {emojiOpen && (
              <div className="absolute z-50 mt-2 grid w-44 grid-cols-4 gap-2 rounded-md border bg-background p-3 shadow-lg">
                {EMOJI_PRESETS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setEmoji(item);
                      setEmojiOpen(false);
                    }}
                    className="flex size-9 items-center justify-center rounded-md text-xl hover:bg-accent"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        <div className="flex-1 space-y-1.5">
          <label className="block text-sm font-medium">
            Name *
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className={inputClass}
          />
        </div>
      </div>


      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What belongs in this collection?"
        disabled={isSubmitting}
        className={cn(inputClass, "resize-none")}
      />


      <div className="flex gap-2">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setColor(preset)}
            className={cn(
              "size-7 rounded-full",
              color === preset &&
                "ring-2 ring-foreground"
            )}
            style={{ backgroundColor: preset }}
          />
        ))}
      </div>


      {displayError && (
        <p className="text-sm text-destructive">
          {displayError}
        </p>
      )}


      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>

    </form>
  );
}