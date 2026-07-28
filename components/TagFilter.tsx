"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseTagsParam } from "@/lib/tags";

interface TagFilterProps {
  tags: string[];
  variant?: "sidebar" | "inline";
}

export default function TagFilter({ tags, variant = "sidebar" }: TagFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedTags = useMemo(
    () => parseTagsParam(searchParams.get("tags")),
    [searchParams]
  );

  const updateTags = useCallback(
    (nextTags: string[]) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextTags.length === 0) {
        params.delete("tags");
      } else {
        params.set("tags", nextTags.join(","));
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleTag = useCallback(
    (tag: string) => {
      const key = tag.toLowerCase();
      const isSelected = selectedTags.some((t) => t.toLowerCase() === key);

      if (isSelected) {
        updateTags(
          selectedTags.filter((t) => t.toLowerCase() !== key)
        );
      } else {
        updateTags([...selectedTags, tag]);
      }
    },
    [selectedTags, updateTags]
  );

  const clearTags = useCallback(() => {
    updateTags([]);
  }, [updateTags]);

  if (tags.length === 0) {
    return null;
  }

  const isSidebar = variant === "sidebar";

  if (!isSidebar) {
    return (
      <div className="md:hidden">
        <TagFilterContent
          tags={tags}
          isSidebar={isSidebar}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          clearTags={clearTags}
        />
      </div>
    );
  }

  return (
    <TagFilterContent
      tags={tags}
      isSidebar={isSidebar}
      selectedTags={selectedTags}
      toggleTag={toggleTag}
      clearTags={clearTags}
    />
  );
}

function TagFilterContent({
  tags,
  isSidebar,
  selectedTags,
  toggleTag,
  clearTags,
}: {
  tags: string[];
  isSidebar: boolean;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div className={isSidebar ? "px-4 pb-4" : "space-y-3"}>
      <div
        className={`flex items-center justify-between gap-2 ${
          isSidebar ? "px-0 mb-2" : ""
        }`}
      >
        <p
          className={`font-medium text-text-muted uppercase tracking-wider ${
            isSidebar ? "text-[11px] px-0" : "text-xs"
          }`}
        >
          Tags
        </p>
        {selectedTags.length > 0 && (
          <button
            type="button"
            onClick={clearTags}
            className="text-[11px] text-accent hover:text-accent/80 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      <div className={isSidebar ? "flex flex-wrap gap-1.5" : "flex flex-wrap gap-2"}>
        {tags.map((tag) => {
          const isSelected = selectedTags.some(
            (t) => t.toLowerCase() === tag.toLowerCase()
          );

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={isSelected}
              className={`tag-chip ${isSelected ? "tag-chip-active" : ""}`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
