/** The five cover families from DESIGN.md. All colour in the app lives here. */
export const FAMILIES = {
  ember: ["#E8A06A", "#C1502A", "#6E2412"],
  clay: ["#D8B49C", "#A46E52", "#5F3A27"],
  dusk: ["#B3A9DC", "#7D6DB4", "#47407A"],
  sage: ["#C9D4C6", "#8FA592", "#4F6353"],
  slate: ["#9DB0C4", "#5F7C99", "#33475C"],
} as const;

export type Family = keyof typeof FAMILIES;

/**
 * The cover face. Each family is a piece of artwork in /public/covers, not a
 * CSS gradient — the FAMILIES stops below are kept because the flip side still
 * tints from them, and because they document each artwork's palette.
 */
export function coverStyle(family: Family): {
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundColor: string;
} {
  return {
    backgroundImage: `url(/covers/${family}.jpg)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    // Shows while the image loads, so a cover is never a blank rectangle.
    backgroundColor: FAMILIES[family][1],
  };
}

/** Light grain overlay, inlined so covers stay self-contained. */
export const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E\")";

/**
 * Spine size, varied per volume so a row reads as a shelf rather than a chart.
 * Deterministic — hashed from the id, never random, so it survives re-render
 * and matches between server and client.
 */
export function spineMetrics(id: string): { width: number; height: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  // Wide spread on both axes — a real shelf is not a chart of equal bars.
  const widths = [26, 32, 38, 44, 50, 58, 66];
  const heights = [148, 166, 180, 194, 208, 224, 240, 258];
  return {
    width: widths[hash % widths.length],
    height: heights[(hash >>> 3) % heights.length],
  };
}

/** The lightest stop of a family — used to tint the back of a cover. */
export function familyTint(family: Family): string {
  return FAMILIES[family][0];
}

/** A stable family for something with no cover of its own, e.g. a search result. */
export function familyForKey(key: string): Family {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const names = Object.keys(FAMILIES) as Family[];
  return names[hash % names.length];
}

/**
 * Ten volumes share five artworks, so each is reflected or turned to give a
 * different composition from the same palette. Deterministic per volume, and
 * free — it is a transform on the same image, not another file to download.
 */
const VARIANTS = [
  "none",
  "scaleX(-1)",
  "rotate(180deg)",
  "scaleY(-1)",
  "scaleX(-1) rotate(180deg)",
  "scale(1.3) rotate(90deg)",
  "scale(1.3) rotate(-90deg)",
  "scale(1.15) translate(6%, -6%)",
];

/**
 * Spines only use transforms that keep the layer's box. A 90-degree turn on a
 * tall narrow spine rotates its artwork out of the frame and leaves most of the
 * face bare — which is what made half the shelf render as pale grey.
 */
const SPINE_VARIANTS = [
  "none",
  "scaleX(-1)",
  "rotate(180deg)",
  "scaleY(-1)",
  "scaleX(-1) rotate(180deg)",
  "scale(1.2) translate(4%, -8%)",
];

export function spineVariant(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return SPINE_VARIANTS[hash % SPINE_VARIANTS.length];
}

export function coverVariant(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return VARIANTS[hash % VARIANTS.length];
}

/**
 * Spine size. Varied per volume so a row reads as a shelf rather than a chart
 * of equal bars, deterministic so a volume never changes width, and shipped at
 * both sizes as custom properties so a media query picks one — no width
 * detection, no hydration flash.
 */
export function spineVars(key: string): Record<string, string> {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const wm = [40, 46, 54, 62, 70][hash % 5];
  const hm = [158, 176, 190, 206, 222][(hash >>> 3) % 5];
  const wd = [64, 74, 84, 94, 106][hash % 5];
  const hd = [236, 258, 278, 298, 320][(hash >>> 3) % 5];
  return {
    "--sw-m": `${wm}px`,
    "--sh-m": `${hm}px`,
    "--sw-d": `${wd}px`,
    "--sh-d": `${hd}px`,
  };
}
