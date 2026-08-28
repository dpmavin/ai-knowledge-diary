import { seedFragments, seedInterestSummary, seedVolumes } from "./seed";
import type { Fragment, InterestSummary, Volume } from "./types";

const KEYS = {
  volumes: "volumes",
  fragments: "fragments",
  interestSummary: "interestSummary",
  /** Written by the Chrome extension, drained by the app on load. */
  inbox: "librarySaves",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback; // corrupt storage falls back rather than crashing
  }
}

function write(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota or private mode — in-memory state stays correct
  }
}

/**
 * Backfill seeded volumes with fields the seed has gained since storage was
 * written. Only fills what is empty, and only on volumes whose id is in the
 * seed — anything saved by hand or by the extension is left alone. Without
 * this, every seed change is invisible until localStorage is cleared.
 */
function backfillFromSeed(stored: Volume[]): Volume[] {
  const bySeedId = new Map(seedVolumes.map((v) => [v.id, v]));
  return stored.map((volume) => {
    const seed = bySeedId.get(volume.id);
    if (!seed) return volume;
    return {
      ...volume,
      articleSummary: volume.articleSummary || seed.articleSummary,
      keyPoints: volume.keyPoints?.length ? volume.keyPoints : seed.keyPoints,
      recommendations: volume.recommendations?.length
        ? volume.recommendations
        : seed.recommendations,
      tags: volume.tags?.length ? volume.tags : (seed.tags ?? []),
    };
  });
}

export function loadVolumes(): Volume[] {
  const stored = read<Volume[] | null>(KEYS.volumes, null);
  if (stored === null) return seedVolumes;
  return backfillFromSeed(stored);
}
export function saveVolumes(v: Volume[]): void {
  write(KEYS.volumes, v);
}
export function loadFragments(): Fragment[] {
  return read<Fragment[]>(KEYS.fragments, seedFragments);
}
export function saveFragments(f: Fragment[]): void {
  write(KEYS.fragments, f);
}
export function loadInterestSummary(): InterestSummary | null {
  // Falls back to the pre-computed one, so the shelf never waits on a call.
  return read<InterestSummary | null>(KEYS.interestSummary, seedInterestSummary);
}
export function saveInterestSummary(s: InterestSummary): void {
  write(KEYS.interestSummary, s);
}

/** One capture handed over by the extension. */
export type InboxItem = {
  passage: string;
  thought: string;
  rawThought: string;
  title: string;
  source: string;
  link: string;
};

/** Read and clear the extension's handoff queue. */
export function drainInbox(): InboxItem[] {
  const items = read<InboxItem[]>(KEYS.inbox, []);
  if (items.length > 0) write(KEYS.inbox, []);
  return items;
}
