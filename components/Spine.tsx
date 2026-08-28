"use client";

import Link from "next/link";
import { coverStyle, GRAIN_URL, spineVariant, spineVars } from "@/lib/covers";
import type { Fragment, Volume } from "@/lib/types";

/**
 * A book standing on the shelf: the artwork runs the full face edge to edge, a
 * page block sits on one side, and the top edge catches light.
 *
 * `align` keeps the hover card inside the frame — books near either end of the
 * row anchor their card to that edge instead of centring it, so it is never
 * clipped by the scroll container.
 */
export default function Spine({
  volume,
  fragments,
  onEnter,
  onLeave,
}: {
  volume: Volume;
  fragments: Fragment[];
  onEnter: (volume: Volume, thought: string, el: HTMLElement) => void;
  onLeave: () => void;
}) {
  const status = volume.unread
    ? "unread"
    : volume.unannotated
      ? "unannotated"
      : null;

  const thought =
    fragments
      .filter((f) => f.volumeId === volume.id && f.thought.trim() !== "")
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.thought ?? "";

  return (
    <div
      className="group relative flex shrink-0 items-end"
      style={spineVars(volume.id) as React.CSSProperties}
      onMouseEnter={(event) => onEnter(volume, thought, event.currentTarget)}
      onMouseLeave={onLeave}
    >
      <Link
        href={`/volume/${volume.id}`}
        aria-label={`${volume.title}, ${volume.source}${status ? `, ${status}` : ""}`}
        className="spine relative block overflow-hidden rounded-t-[3px] transition-transform duration-[420ms] ease-[cubic-bezier(.34,1.8,.5,1)] group-hover:-translate-y-3"
      >
        {/* the face — artwork edge to edge */}
        <span
          className="absolute inset-0"
          style={{
            ...coverStyle(volume.coverFamily),
            transform: spineVariant(volume.id),
          }}
        />
        <span
          className="absolute inset-0 mix-blend-overlay"
          style={{ backgroundImage: GRAIN_URL }}
        />

        {/* page block down the right edge, and the lit top edge */}
        <span className="absolute inset-y-0 right-0 w-[5px] bg-[#efece6] md:w-[7px]" />
        <span className="absolute inset-y-0 right-[5px] w-px bg-ink/25 md:right-[7px]" />
        <span className="absolute inset-x-0 top-0 h-px bg-white/40" />
        {/* the hinge, where the cover folds into the spine */}
        <span className="absolute inset-y-0 left-[3px] w-px bg-ink/20" />

        {status && (
          <span
            className={
              status === "unread"
                ? "absolute left-1/2 top-3 h-[6px] w-[6px] -translate-x-1/2 rounded-[999px] bg-white"
                : "absolute left-1/2 top-3 h-[6px] w-[6px] -translate-x-1/2 rounded-[999px] border border-white/70"
            }
          />
        )}

        <span
          className="absolute bottom-4 left-0 right-[6px] top-9 md:right-[8px] md:top-12 flex items-start justify-center overflow-hidden font-display text-[16px] leading-none text-white md:text-[20px]"
          style={{ writingMode: "vertical-rl" }}
        >
          {volume.title}
        </span>
      </Link>
    </div>
  );
}
