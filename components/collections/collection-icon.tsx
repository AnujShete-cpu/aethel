import { cn } from "@/lib/utils";

type CollectionIconProps = {
  name: string;
  emoji?: string | null;
  color?: string | null;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES = {
  sm: "size-8 text-base",
  md: "size-10 text-lg",
  lg: "size-14 text-2xl",
} as const;

export function CollectionIcon({ name, emoji, color, size = "md" }: CollectionIconProps) {
  const background = color ?? "#6366F1";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-medium text-white",
        SIZE_CLASSES[size]
      )}
      style={{ backgroundColor: background }}
      aria-hidden="true"
    >
      {emoji ? emoji : name.charAt(0).toUpperCase()}
    </div>
  );
}
