"use client";

import Link from "next/link";
import type { Volume } from "@/lib/types";

export type Hovered = {
  volume: Volume;
  thought: string;
  rect: DOMRect;
  /** The shelf's own rect — the card sits above all of it, not above one book. */
  shelfTop: number;
};

function shortDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    .toUpperCase();
}

/**
 * Rendered outside the shelf's scroll container and positioned against the
 * spine's measured rect. A horizontally scrolling box clips vertically too, so
 * a card anchored inside one either gets cut off or forces dead headroom.
 */
export default function SpineCard({
  hovered,
  onEnter,
  onLeave,
}: {
  hovered: Hovered;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const { volume, thought, rect, shelfTop } = hovered;
  const WIDTH = 260;
  const half = WIDTH / 2;

  const left = Math.min(
    Math.max(rect.left + rect.width / 2, half + 20),
    window.innerWidth - half - 20,
  );

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="fixed z-40 w-[260px] -translate-x-1/2 overflow-hidden rounded-[12px] border border-hairline bg-page"
      /*
       * Anchored to the shelf, not to this spine: a short book would drop the
       * card over its taller neighbours, and the card would then swallow the
       * pointer that was trying to scroll them.
       */
      style={{ left, bottom: window.innerHeight - shelfTop + 14 }}
    >
      <div className="p-4 pb-3.5">
        <p className="meta">{volume.source}</p>
        <Link
          href={`/volume/${volume.id}`}
          className="mt-2 block overflow-hidden font-display text-[20px] leading-tight [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]"
        >
          {volume.title}
        </Link>
        <p className="meta mt-1.5">{shortDate(volume.dateSaved)}</p>
        {thought ? (
          <p className="mt-3 overflow-hidden border-t border-hairline pt-3 text-[15px] leading-relaxed text-mute [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]">
            {thought}
          </p>
        ) : (
          <p className="mt-3 border-t border-hairline pt-3 text-[15px] leading-relaxed text-mute">
            Saved without a sentence — say one now.
          </p>
        )}
        <Link
          href={`/volume/${volume.id}`}
          className="meta mt-3 block text-warm"
        >
          Open ›
        </Link>
      </div>
    </div>
  );
}
