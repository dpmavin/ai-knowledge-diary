"use client";

import { useCallback, useEffect, useState } from "react";
import { cleanTranscript, enrich, findMore, interestSummary } from "./claude";
import {
  drainInbox,
  loadFragments,
  loadInterestSummary,
  loadVolumes,
  saveFragments,
  saveInterestSummary,
  saveVolumes,
} from "./store";
import { COVER_FAMILIES, newId } from "./types";
import type { Fragment, InterestSummary, Rec, Volume } from "./types";

export type SaveInput = {
  passage: string;
  thought: string;
  /** Set when the thought was spoken; triggers artefact cleanup. */
  rawThought?: string;
  title?: string;
  source?: string;
  link?: string;
  /** Captured at save time, used for one enrichment call, then dropped. */
  articleText?: string;
};

function domainOf(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function fallbackFamily(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return COVER_FAMILIES[hash % COVER_FAMILIES.length];
}

export function useLibrary() {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [summary, setSummary] = useState<InterestSummary | null>(null);
  const [ready, setReady] = useState(false);

  const commitVolumes = useCallback((next: Volume[]) => {
    setVolumes(next);
    saveVolumes(next);
  }, []);

  const commitFragments = useCallback((next: Fragment[]) => {
    setFragments(next);
    saveFragments(next);
  }, []);

  /**
   * The one save path. The extension and the Add sheet both come through here.
   * Writes synchronously and returns; Claude runs afterwards and patches.
   */
  const save = useCallback(
    (input: SaveInput) => {
      const link = input.link?.trim() ?? "";
      const now = new Date().toISOString();
      const currentVolumes = loadVolumes();
      const currentFragments = loadFragments();

      // Same URL adds a Fragment to the existing Volume — never a duplicate.
      const existing = link
        ? currentVolumes.find((v) => v.link === link)
        : undefined;

      const volumeId = existing ? existing.id : newId("v");
      const hasThought = input.thought.trim() !== "";

      const fragment: Fragment = {
        id: newId("f"),
        volumeId,
        passage: input.passage.trim(),
        thought: input.thought.trim(),
        rawThought: input.rawThought?.trim() ?? "",
        date: now,
      };

      let nextVolumes: Volume[];
      if (existing) {
        // Engaging with a volume clears both statuses.
        nextVolumes = currentVolumes.map((v) =>
          v.id === existing.id
            ? {
                ...v,
                unread: false,
                unannotated: hasThought ? false : v.unannotated,
              }
            : v,
        );
      } else {
        const fresh: Volume = {
          id: volumeId,
          title: input.title?.trim() || domainOf(link) || "Untitled",
          author: "",
          link,
          source: input.source?.trim() || domainOf(link) || "Saved by hand",
          dateSaved: now,
          shelf: "Unsorted",
          articleSummary: "",
          keyPoints: [],
          recommendations: [],
          tags: [],
          unread: false,
          unannotated: !hasThought,
          coverFamily: fallbackFamily(volumeId),
        };
        nextVolumes = [fresh, ...currentVolumes];
      }

      const nextFragments = [...currentFragments, fragment];
      commitVolumes(nextVolumes);
      commitFragments(nextFragments);

      // Everything past this point is best-effort. A failure keeps the save.
      void (async () => {
        // Spoken or typed, the thought gets the same repair. What differs is
        // that a spoken one keeps its raw transcript for comparison.
        if (fragment.thought !== "") {
          try {
            const cleaned = await cleanTranscript(fragment.thought);
            const patched = loadFragments().map((f) =>
              f.id === fragment.id ? { ...f, thought: cleaned } : f,
            );
            commitFragments(patched);
          } catch {
            // keep what they wrote, unrepaired
          }
        }

        if (!existing) {
          try {
            const result = await enrich({
              passage: fragment.passage,
              articleText: input.articleText ?? "",
              pageTitle: input.title ?? "",
              source: input.source ?? domainOf(link),
              existingShelves: [...new Set(nextVolumes.map((v) => v.shelf))].filter(
                (s) => s !== "Unsorted",
              ),
            });
            const patched = loadVolumes().map((v) =>
              v.id === volumeId
                ? {
                    ...v,
                    title: result.title || v.title,
                    author: result.author || v.author,
                    articleSummary: result.articleSummary,
                    keyPoints: result.keyPoints,
                    shelf: result.shelf || "Unsorted",
                    coverFamily: result.coverFamily,
                  }
                : v,
            );
            commitVolumes(patched);
          } catch {
            // shelf stays "Unsorted" with the fallback cover — the save survives
          }
        }
        /**
         * Related items are fetched now, not when the volume is opened, so
         * they are already there the first time it is. IA.md: the user never
         * prompts for them.
         */
        try {
          const results = await findMore({
            thought: fragment.thought,
            passage: fragment.passage,
            articleTitle: loadVolumes().find((v) => v.id === volumeId)?.title ?? "",
            source: input.source ?? domainOf(link),
          });
          if (results.length > 0) {
            commitVolumes(
              loadVolumes().map((v) =>
                v.id === volumeId ? { ...v, recommendations: results } : v,
              ),
            );
          }
        } catch {
          // the volume screen retries on open
        }

        // input.articleText goes out of scope here. It is never written anywhere.
      })();

      return volumeId;
    },
    [commitFragments, commitVolumes],
  );

  /** Writing a thought onto an existing fragment clears `unannotated`. */
  const addThought = useCallback(
    (fragmentId: string, thought: string) => {
      const nextFragments = loadFragments().map((f) =>
        f.id === fragmentId ? { ...f, thought: thought.trim() } : f,
      );
      commitFragments(nextFragments);

      const target = nextFragments.find((f) => f.id === fragmentId);
      if (!target) return;
      const stillBare = nextFragments
        .filter((f) => f.volumeId === target.volumeId)
        .every((f) => f.thought.trim() === "");
      commitVolumes(
        loadVolumes().map((v) =>
          v.id === target.volumeId ? { ...v, unannotated: stillBare } : v,
        ),
      );
    },
    [commitFragments, commitVolumes],
  );

  const setTags = useCallback(
    (volumeId: string, tags: string[]) => {
      commitVolumes(
        loadVolumes().map((v) => (v.id === volumeId ? { ...v, tags } : v)),
      );
    },
    [commitVolumes],
  );

  const cacheRecommendations = useCallback(
    (volumeId: string, recommendations: Rec[]) => {
      commitVolumes(
        loadVolumes().map((v) =>
          v.id === volumeId ? { ...v, recommendations } : v,
        ),
      );
    },
    [commitVolumes],
  );

  /** Saving a recommendation creates a Volume marked unread, with no fragments. */
  const saveRecommendation = useCallback(
    (rec: Rec, shelf: string) => {
      const current = loadVolumes();
      if (current.some((v) => v.link === rec.link)) return;
      const id = newId("v");
      commitVolumes([
        {
          id,
          title: rec.title,
          author: "",
          link: rec.link,
          source: rec.source || domainOf(rec.link),
          dateSaved: new Date().toISOString(),
          shelf,
          articleSummary: rec.why,
          keyPoints: [],
          recommendations: [],
          tags: [],
          unread: true,
          unannotated: false,
          coverFamily: fallbackFamily(id),
        },
        ...current,
      ]);
    },
    [commitVolumes],
  );

  useEffect(() => {
    const inbox = drainInbox();
    setVolumes(loadVolumes());
    setFragments(loadFragments());
    setSummary(loadInterestSummary());
    setReady(true);
    for (const item of inbox) save(item);
  }, [save]);

  // Interest summary regenerates in the background when the count changes.
  useEffect(() => {
    if (!ready || volumes.length === 0) return;
    const cached = loadInterestSummary();
    if (cached && cached.volumeCount === volumes.length) return;

    const thoughts = loadFragments()
      .filter((f) => f.thought.trim() !== "")
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 12)
      .map((f) => f.thought);
    if (thoughts.length === 0) return;

    void (async () => {
      try {
        const text = await interestSummary(thoughts);
        const next = {
          text,
          generatedAt: new Date().toISOString(),
          volumeCount: volumes.length,
        };
        saveInterestSummary(next);
        setSummary(next);
      } catch {
        // keep whatever was cached
      }
    })();
  }, [ready, volumes.length]);

  return {
    ready,
    volumes,
    fragments,
    summary,
    save,
    addThought,
    setTags,
    cacheRecommendations,
    saveRecommendation,
  };
}
