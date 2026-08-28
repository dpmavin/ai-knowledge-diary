/** The five cover families from DESIGN.md. */
export type CoverFamily = "ember" | "clay" | "dusk" | "sage" | "slate";

export const COVER_FAMILIES: CoverFamily[] = [
  "ember",
  "clay",
  "dusk",
  "sage",
  "slate",
];

/** One cached "Find more" result. Lives on the Volume so it never re-fetches. */
export type Rec = {
  title: string;
  link: string;
  source: string;
  /** Only present when web search reported one. */
  publishedDate?: string;
  /** One sentence on why this follows my thought specifically. */
  why: string;
};

/** One source. Many Fragments inside it. Never holds the full article text. */
export type Volume = {
  id: string;
  title: string;
  author: string;
  link: string;
  source: string;
  dateSaved: string; // ISO
  shelf: string;
  /** What the article says — 2-3 sentences, generated at save time. */
  articleSummary: string;
  /** What the article itself emphasised — 3 points, generated at save time. */
  keyPoints: string[];
  /** Cached Find more results. Empty means never fetched. */
  recommendations: Rec[];
  /** Freeform labels, added by hand on the volume screen. */
  tags: string[];
  /** Saved from a recommendation, not yet read. Clears by saving a fragment. */
  unread: boolean;
  /** Saved without a thought. Clears by writing one. */
  unannotated: boolean;
  coverFamily: CoverFamily;
};

/** One highlight inside a Volume. */
export type Fragment = {
  id: string;
  volumeId: string;
  passage: string; // their words
  thought: string; // my words — the primary object in the system
  /**
   * The untouched voice transcript. Cleanup on `thought` repairs transcription
   * artefacts only, so keeping this makes the repair auditable.
   */
  rawThought: string;
  date: string; // ISO
};

/** Cached interest summary for the shelf header. */
export type InterestSummary = {
  text: string;
  generatedAt: string; // ISO
  volumeCount: number; // what it was built from, so we know when it's stale
};

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
