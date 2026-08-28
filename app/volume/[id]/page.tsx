"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import FragmentCard from "@/components/FragmentCard";
import RailCard from "@/components/RailCard";
import Tags from "@/components/Tags";
import { findMore } from "@/lib/claude";
import { coverStyle, GRAIN_URL, spineVariant } from "@/lib/covers";
import { useLibrary } from "@/lib/library";
import type { Fragment, Rec, Volume } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function VolumeScreen({ params }: PageProps<"/volume/[id]">) {
  const { id } = use(params);
  const {
    ready,
    volumes,
    fragments,
    addThought,
    setTags,
    cacheRecommendations,
    saveRecommendation,
  } = useLibrary();
  const [finding, setFinding] = useState(false);
  const [findError, setFindError] = useState("");
  /** One automatic attempt per volume per session — a failure must not loop. */
  const attempted = useRef<Set<string>>(new Set());

  const volume = volumes.find((v) => v.id === id);

  const own = fragments
    .filter((f) => f.volumeId === id)
    .sort((a, b) => a.date.localeCompare(b.date)); // IA.md: oldest first

  /**
   * Declared before any early return. React counts hooks per render, so a hook
   * placed after `if (!ready) return` is called on the second render but not
   * the first — which is the order violation this used to raise.
   */
  const runFindMore = useCallback(
    async (target: Volume, driver: Fragment | null, force: boolean) => {
      if (!force && target.recommendations.length > 0) return;
      setFinding(true);
      setFindError("");
      try {
        const results = await findMore({
          thought: driver?.thought ?? "",
          passage: driver?.passage ?? target.articleSummary,
          articleTitle: target.title,
          source: target.source,
        });
        if (results.length === 0) {
          setFindError("Search came back with nothing usable.");
        }
        cacheRecommendations(target.id, results);
      } catch (error) {
        setFindError(
          error instanceof Error
            ? error.message
            : "Could not fetch related items.",
        );
      } finally {
        setFinding(false);
      }
    },
    [cacheRecommendations],
  );

  const driver = own.find((f) => f.thought.trim() !== "") ?? own[0] ?? null;

  /** Fetch on open when nothing is cached, so there is no CTA to click. */
  useEffect(() => {
    if (!ready || !volume) return;
    if (volume.recommendations.length > 0) return;
    if (attempted.current.has(volume.id)) return;
    attempted.current.add(volume.id);
    void runFindMore(volume, driver, false);
  }, [ready, volume, driver, runFindMore]);

  if (!ready) return <div className="px-5 pt-10" />;
  if (!volume) {
    return (
      <div className="px-5 pt-10">
        <p className="text-[15px] text-mute">That volume is not in the library.</p>
        <Link href="/" className="meta mt-4 block text-warm">
          My library
        </Link>
      </div>
    );
  }

  const refresh = () => void runFindMore(volume, driver, true);

  const savedLinks = new Set(volumes.map((v) => v.link));

  const related = (
    <>
      {volume.recommendations.length === 0 ? (
        finding ? (
          <div className="space-y-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-[92px] w-[72px] shrink-0 animate-pulse rounded-[3px] bg-surface" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 animate-pulse rounded-[999px] bg-surface" />
                  <div className="h-4 w-full animate-pulse rounded-[999px] bg-surface" />
                  <div className="h-3 w-4/5 animate-pulse rounded-[999px] bg-surface" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={refresh}
            className="rounded-[999px] border border-hairline bg-page px-5 py-2 text-[15px] font-medium text-ink"
          >
            Find related
          </button>
        )
      ) : (
        <div className="space-y-8">
          {volume.recommendations.map((rec: Rec) => (
            <RailCard
              key={rec.link}
              rec={rec}
              saved={savedLinks.has(rec.link)}
              onSave={() => saveRecommendation(rec, volume.shelf)}
            />
          ))}
        </div>
      )}

      {findError && (
        <p className="mt-4 text-[15px] leading-relaxed text-mute">{findError}</p>
      )}
    </>
  );

  return (
    <div className="relative z-[1] md:grid md:grid-cols-[336px_1fr]">
      {/* Left rail — related content, sticky, scrolling on its own */}
      <aside className="hidden border-r border-hairline bg-surface md:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex items-center gap-4 px-8 pb-5 pt-10">
            <h2 className="meta shrink-0">Related</h2>
            <span className="h-px flex-1 bg-hairline" />
            {volume.recommendations.length > 0 && (
              <button
                onClick={refresh}
                disabled={finding}
                className="meta shrink-0 text-warm disabled:opacity-40"
              >
                {finding ? "…" : "Refresh"}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-12">{related}</div>
        </div>
      </aside>

      {/* Right — the entry */}
      <main className="relative">
        {/* the outer metadata rail, set vertically */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-14 items-center justify-center xl:flex">
          <p
            className="meta whitespace-nowrap"
            style={{ writingMode: "vertical-rl" }}
          >
            {volume.source} — {formatDate(volume.dateSaved)} —{" "}
            {volume.unread ? "unread" : own.length > 0 ? "read" : "saved"}
          </p>
        </div>

        <div className="mx-auto max-w-[680px] px-5 pb-24 pt-10 md:px-10 md:pt-16 xl:pr-0">
          <Link
            href="/"
            className="meta inline-flex items-center gap-2 text-warm"
          >
            {/* hand-drawn, so no icon library enters the project */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 5 8 12l7 7" />
            </svg>
            My library
          </Link>

          <div className="mt-10 flex items-start gap-6">
            {/* the book itself, small — this is still an object, not a document */}
            <div
              className="relative hidden h-[126px] w-[98px] shrink-0 overflow-hidden rounded-[3px] sm:block"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(10,10,10,0.14)",
              }}
            >
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
            </div>

            <div className="min-w-0">
              <p className="meta">{formatDate(volume.dateSaved)}</p>
              <h1 className="mt-3 font-display text-[38px] font-light leading-[1.05] md:text-[52px]">
                {volume.title}
                <span className="ml-2 inline-block h-[7px] w-[7px] rounded-[999px] bg-warm align-baseline" />
              </h1>
              {volume.author && (
                <p className="meta mt-3">{volume.author}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-8">
            <Tags
              tags={volume.tags}
              onChange={(next) => setTags(volume.id, next)}
            />
          </div>

          {/* What it says */}
          {volume.articleSummary && (
            <p className="mt-10 text-[17px] leading-[1.7] md:text-[19px]">
              {volume.articleSummary}
            </p>
          )}

          {/* What it emphasized */}
          {volume.keyPoints.length > 0 && (
            <section className="mt-10 border-t border-hairline pt-8">
              <h2 className="meta mb-4">What it emphasized</h2>
              <ul className="space-y-3">
                {volume.keyPoints.map((point) => (
                  <li
                    key={point}
                    className="text-[15px] leading-relaxed text-mute md:text-[19px]"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* What I took */}
          <section className="mt-10">
            <h2 className="meta mb-8">What I took</h2>
            {own.length === 0 ? (
              <p className="border-t border-hairline pt-8 text-[15px] leading-relaxed text-mute">
                Nothing yet. Read it, then save what stays with you.
              </p>
            ) : (
              <div className="space-y-10">
                {own.map((fragment) => (
                  <FragmentCard
                    key={fragment.id}
                    fragment={fragment}
                    onAddThought={addThought}
                  />
                ))}
              </div>
            )}
          </section>

          {volume.link && (
            <a
              href={volume.link}
              target="_blank"
              rel="noreferrer"
              className="mt-12 block rounded-[999px] border border-hairline bg-page py-3 text-center text-[15px] font-medium text-ink"
            >
              Open the original
            </a>
          )}

          {/* Related, stacked under the entry on mobile */}
          <section className="mt-14 md:hidden">
            <h2 className="meta mb-6">Related</h2>
            {related}
          </section>
        </div>
      </main>
    </div>
  );
}
