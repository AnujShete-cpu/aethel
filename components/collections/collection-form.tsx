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
    <span className="text-sm font-bold text-foreground">⌄</span>
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