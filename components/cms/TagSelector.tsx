"use client";

import { cn } from "@/lib/utils";
import { Tag } from "@/types/cms";

interface TagSelectorProps {
  tags: Tag[];
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
}

export function TagSelector({
  tags,
  selectedTagId,
  onSelectTag,
}: TagSelectorProps) {
  const baseClassName =
    "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
  const inactiveClassName =
    "border-transparent bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:border-primary/15 hover:bg-white hover:text-foreground hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]";
  const activeClassName =
    "border-primary/20 bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(239,68,68,0.18)]";

  return (
    <div className="mb-6 flex flex-wrap justify-center gap-3">
      <button
        onClick={() => onSelectTag(null)}
        className={cn(
          baseClassName,
          selectedTagId === null ? activeClassName : inactiveClassName
        )}
      >
        All
      </button>

      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onSelectTag(tag.id)}
          className={cn(
            baseClassName,
            selectedTagId === tag.id ? activeClassName : inactiveClassName
          )}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
