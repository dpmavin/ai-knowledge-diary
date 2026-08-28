"use client";

import { Tilt } from "@/components/motion/tilt";
import { coverStyle, familyForKey, GRAIN_URL } from "@/lib/covers";
import type { Rec } from "@/lib/types";

function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toLowerCase();
}

/**
 * Square card, per the wireframe: the face is left open, then a rule, the
 * article name and date on one baseline, and a chip row beneath. Built from
 * DESIGN.md — the wireframe's grey block is a cover gradient, its hairline is
 * --hairline at cover opacity, and its chips are the pill radius.
 */
export default function RelatedCard({
  rec,
  saved,
  onSave,
}: {
  rec: Rec;
  saved: boolean;
  onSave: () => void;
}) {
  const family = familyForKey(rec.link);
  const date = rec.publishedDate ? formatDate(rec.publishedDate) : "";

  return (
    <Tilt
      rotationFactor={7}
      springOptions={{ stiffness: 220, damping: 26 }}
      className="relative flex aspect-square flex-col justify-end overflow-hidden rounded-[14px] p-4"
      style={{
        ...coverStyle(family),
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 0 0 1px rgba(10,10,10,0.10), inset 0 -28px 40px -24px rgba(10,10,10,0.35)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: GRAIN_URL }}
      />

      {/* rule, then name and date on one baseline */}
      <div className="relative flex items-baseline justify-between gap-3 border-t border-white/40 pt-2">
        <a
          href={rec.link}
          target="_blank"
          rel="noreferrer"
          className="font-display text-[20px] leading-tight text-white"
        >
          {rec.title}
        </a>
        {date && <span className="meta shrink-0 !text-white/70">{date}</span>}
      </div>

      {/* why it follows the thought — the reason it is on this screen */}
      <p className="relative mt-2 text-[15px] leading-relaxed text-white/80">
        {rec.why}
      </p>

      {/* chip row */}
      <div className="relative mt-3 flex flex-wrap items-center gap-2">
        <span className="meta rounded-[999px] bg-white/20 px-3 py-1 !text-white">
          {rec.source}
        </span>
        {saved ? (
          <span className="meta rounded-[999px] border border-white/40 px-3 py-1 !text-white/70">
            Saved
          </span>
        ) : (
          <button
            onClick={onSave}
            className="meta rounded-[999px] border border-white/60 px-3 py-1 !text-white"
          >
            Save
          </button>
        )}
      </div>
    </Tilt>
  );
}
