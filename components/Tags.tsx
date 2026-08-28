"use client";

import { useState } from "react";

export default function Tags({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    // Case-insensitive dedupe — "Craft" and "craft" are one tag.
    const exists = tags.some((t) => t.toLowerCase() === value.toLowerCase());
    if (value !== "" && !exists) onChange([...tags, value]);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tags.filter((t) => t !== tag))}
          title="Remove"
          className="rounded-[999px] bg-surface px-3 py-1 text-[15px] text-ink"
        >
          {tag}
        </button>
      ))}

      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          placeholder="Tag"
          className="w-24 rounded-[999px] border border-hairline bg-page px-3 py-1 text-[15px] text-ink placeholder:text-mute focus:outline-none"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-[999px] border border-hairline bg-page px-3 py-1 text-[15px] text-mute"
        >
          + Add new tag
        </button>
      )}
    </div>
  );
}
