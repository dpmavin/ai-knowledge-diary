"use client";

import { useRef, useState } from "react";
import AddSheet from "@/components/AddSheet";
import Spine from "@/components/Spine";
import SpineCard, { type Hovered } from "@/components/SpineCard";
import ExtensionInbox from "@/components/ExtensionInbox";
import { useLibrary } from "@/lib/library";
import type { Volume } from "@/lib/types";

/**
 * One shelf, every volume on it. Shelves still order the line — same-shelf
 * volumes stand together and groups run most-recently-added-to first — so the
 * grouping reads as clustering rather than as labelled sections.
 */
function shelvedOrder(volumes: Volume[]): Volume[] {
  const byShelf = new Map<string, Volume[]>();
  for (const volume of volumes) {
    const existing = byShelf.get(volume.shelf);
    if (existing) existing.push(volume);
    else byShelf.set(volume.shelf, [volume]);
  }
  return [...byShelf.values()]
    .map((group) =>
      [...group].sort((a, b) => b.dateSaved.localeCompare(a.dateSaved)),
    )
    .sort((a, b) => b[0].dateSaved.localeCompare(a[0].dateSaved))
    .flat();
}

function weekday(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", { weekday: "long" });
}

/** The single accent mark. --warm appears here and almost nowhere else. */
function Dot() {
  return (
    <span className="inline-block h-[5px] w-[5px] shrink-0 rounded-[999px] bg-warm" />
  );
}

export default function Shelf() {
  const { ready, volumes, fragments, summary, save } = useLibrary();
  const [adding, setAdding] = useState(false);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const shelf = shelvedOrder(volumes);

  /** A short delay, so the pointer can travel from the spine into the card. */
  function hide() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setHovered(null), 160);
  }
  const thoughtCount = fragments.filter((f) => f.thought.trim() !== "").length;

  return (
    <div className="flex-1">
      <ExtensionInbox onSave={save} />

      <div className="relative z-[1] mx-auto w-full max-w-[1100px] px-5 pb-40 md:px-10">
        {/* 1. Header */}
        <header className="pt-10">
          <h1 className="font-display text-[38px] font-light leading-none md:text-[48px]">
            My library
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3.5">
            <p className="meta">
              {volumes.length === 1 ? "1 volume" : `${volumes.length} volumes`}
            </p>
            <button
              onClick={() => setAdding(true)}
              className="meta inline-flex items-center gap-2 rounded-[999px] border border-hairline py-[7px] pl-[11px] pr-[14px] transition-colors hover:border-ink hover:text-ink"
            >
              {/* hand-drawn, so no icon library enters the project */}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 6v12M6 12h12" />
              </svg>
              Add
            </button>
          </div>
        </header>

        {/* 2. Interest summary — a read on my own thinking, above the collection */}
        {summary && volumes.length > 0 && (
          <section className="mt-6 max-w-[620px] rounded-[12px] bg-surface p-5 md:max-w-[900px] md:p-7">
            <p className="meta flex items-center gap-2">
              <Dot />
              What you&apos;ve been circling
            </p>
            <p className="mt-3 text-[15px] leading-relaxed md:text-[19px]">{summary.text}</p>
            <p className="meta mt-4">
              From {thoughtCount} of your own thoughts
              {summary.generatedAt && ` · updated ${weekday(summary.generatedAt)}`}
            </p>
          </section>
        )}

        {ready && volumes.length === 0 ? (
          /* Empty state */
          <section className="mt-10 max-w-[520px] md:max-w-none">
            <div className="flex items-end gap-px border-b border-hairline pb-px">
              {[168, 196, 152, 210, 182].map((height, i) => (
                <div
                  key={i}
                  style={{ height, width: 46 }}
                  className="shrink-0 rounded-t-[4px] border border-b-0 border-dashed border-hairline"
                />
              ))}
            </div>

            <p className="mt-8 font-display text-[24px] font-light leading-[1.35]">
              Nothing on the shelf yet.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-mute">
              Save what mattered from what you read, and say one sentence about
              why. That sentence is the point — everything you keep becomes a
              book here.
            </p>

            <button
              onClick={() => setAdding(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-[999px] bg-ink px-7 py-3 text-[15px] font-medium text-white"
            >
              <Dot />
              Say why it mattered
            </button>

            <p className="meta mt-5">Shelves appear on their own as you save</p>
          </section>
        ) : (
          /* 3. The shelf — one line, headroom above for the hover card */
          <div ref={shelfRef}
          className="mt-12 overflow-x-auto px-3 pb-10 md:mt-16">
            <div className="flex w-max items-end gap-px border-b border-hairline pb-px">
              {shelf.map((volume) => (
                <Spine
                  key={volume.id}
                  volume={volume}
                  fragments={fragments}
                  onEnter={(v, thought, el) => {
                    if (hideTimer.current) clearTimeout(hideTimer.current);
                    setHovered({
                      volume: v,
                      thought,
                      rect: el.getBoundingClientRect(),
                      shelfTop:
                        shelfRef.current?.getBoundingClientRect().top ??
                        el.getBoundingClientRect().top,
                    });
                  }}
                  onLeave={hide}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {hovered && (
        <SpineCard
          hovered={hovered}
          onEnter={() => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
          }}
          onLeave={hide}
        />
      )}

      {adding && <AddSheet onSave={save} onClose={() => setAdding(false)} />}
    </div>
  );
}
