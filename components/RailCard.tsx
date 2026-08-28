"use client";

import { coverStyle, familyForKey, GRAIN_URL } from "@/lib/covers";
import type { Rec } from "@/lib/types";

/** A related result, sized for the sticky rail: thumbnail, source, title, why. */
export default function RailCard({
  rec,
  saved,
  onSave,
}: {
  rec: Rec;
  saved: boolean;
  onSave: () => void;
}) {
  const family = familyForKey(rec.link);

  return (
    <article className="flex gap-4">
      <a
        href={rec.link}
        target="_blank"
        rel="noreferrer"
        className="relative block h-[92px] w-[72px] shrink-0 overflow-hidden rounded-[3px]"
        style={{
          ...coverStyle(family),
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(10,10,10,0.14)",
        }}
      >
        <span
          className="absolute inset-0 mix-blend-overlay"
          style={{ backgroundImage: GRAIN_URL }}
        />
      </a>

      <div className="min-w-0">
        <p className="meta">{rec.source}</p>
        <a
          href={rec.link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block font-display text-[20px] leading-tight"
        >
          {rec.title}
        </a>
        <p className="mt-2 overflow-hidden text-[15px] leading-relaxed text-mute [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [display:-webkit-box]">
          {rec.why}
        </p>
        {saved ? (
          <p className="meta mt-2">Already saved</p>
        ) : (
          <button onClick={onSave} className="meta mt-2 text-warm">
            Save to library
          </button>
        )}
      </div>
    </article>
  );
}
