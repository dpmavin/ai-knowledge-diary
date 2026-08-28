import { COVER_FAMILIES } from "./types";
import type { CoverFamily, Rec } from "./types";

async function call(
  prompt: string,
  useWebSearch = false,
): Promise<{ text: string; sources: string[] }> {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt, useWebSearch }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Claude call failed");
  return { text: data.text as string, sources: (data.sources ?? []) as string[] };
}

async function ask(prompt: string, useWebSearch = false): Promise<string> {
  return (await call(prompt, useWebSearch)).text;
}

/** Compare links ignoring protocol, www, trailing slash, and tracking params. */
function normaliseUrl(raw: string): string {
  try {
    const url = new URL(raw);
    url.hash = "";
    url.search = "";
    return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

/** Models often wrap JSON in prose or a code fence. Take the first object/array. */
function parseJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.search(/[[{]/);
  if (start === -1) throw new Error("No JSON in response");
  const opener = body[start];
  const closer = opener === "{" ? "}" : "]";
  const end = body.lastIndexOf(closer);
  if (end <= start) throw new Error("Unterminated JSON in response");
  return JSON.parse(body.slice(start, end + 1)) as T;
}

function asFamily(value: unknown): CoverFamily {
  return COVER_FAMILIES.includes(value as CoverFamily)
    ? (value as CoverFamily)
    : "slate";
}

export type Enrichment = {
  title: string;
  author: string;
  articleSummary: string;
  keyPoints: string[];
  shelf: string;
  coverFamily: CoverFamily;
};

/**
 * The one call made on save. `articleText` is passed in and never stored —
 * it lives in this function's argument and is dropped when the call returns.
 */
export async function enrich(input: {
  passage: string;
  articleText: string;
  pageTitle: string;
  source: string;
  existingShelves: string[];
}): Promise<Enrichment> {
  const prompt = `You are cataloguing one saved article for a personal reading library.

SOURCE: ${input.source}
PAGE TITLE: ${input.pageTitle || "(unknown)"}
EXISTING SHELVES: ${input.existingShelves.join(", ") || "(none yet)"}

HIGHLIGHTED PASSAGE:
${input.passage}

ARTICLE TEXT:
${input.articleText.slice(0, 12000) || "(not captured)"}

Return ONLY a JSON object, no prose, with exactly these keys:
{
  "title": "a short title for the article",
  "author": "the author's name, or an empty string if you cannot tell",
  "articleSummary": "2-3 sentences on what the article says",
  "keyPoints": ["three points THE ARTICLE ITSELF emphasises", "...", "..."],
  "shelf": "a topic group — reuse one of the existing shelves if it fits, else a new short one",
  "coverFamily": "one of: ember, clay, dusk, sage, slate"
}`;

  const raw = parseJson<Record<string, unknown>>(await ask(prompt));
  const points = Array.isArray(raw.keyPoints) ? raw.keyPoints.map(String) : [];
  return {
    title: String(raw.title ?? input.pageTitle ?? "Untitled"),
    author: String(raw.author ?? ""),
    articleSummary: String(raw.articleSummary ?? ""),
    keyPoints: points.slice(0, 3),
    shelf: String(raw.shelf ?? "Unsorted"),
    coverFamily: asFamily(raw.coverFamily),
  };
}

/**
 * Repair a thought. Deliberately narrow: the user's words are the asset, and
 * anything beyond repair is a failure of the feature, not an improvement to it.
 * Spelling and grammar are fixed because a typo is not a thought; wording,
 * register, and content are not, because those are.
 */
export async function cleanTranscript(raw: string): Promise<string> {
  const prompt = `Below is a note someone wrote or dictated about something they read.

FIX ONLY THESE:
- transcription artefacts: false starts and stutters ("this is this is" -> "this is"), filler words (um, uh, like, you know, I mean) where they carry no meaning
- spelling mistakes and obvious typos
- grammar and punctuation: sentence breaks, capitals, agreement, run-ons

CHANGE NOTHING ELSE. Specifically:
- Keep their exact word choices. Do not find a better word.
- Keep their register. Do not make it more formal, more professional, or more concise.
- Keep every idea, in their order, at their emphasis. Add nothing. Remove nothing.
- Keep their voice, including fragments and asides that are clearly deliberate.
- If it is already clean, return it unchanged.

Return ONLY the repaired text. No preamble, no quotation marks, no commentary.

NOTE:
${raw}`;

  const cleaned = (await ask(prompt)).trim();
  // A repair that loses a third of the words is a rewrite. Keep the original.
  if (cleaned.length < raw.length * 0.6) return raw;
  return cleaned;
}

export async function interestSummary(thoughts: string[]): Promise<string> {
  const prompt = `These are one person's own notes, written in their own words, about things they have read recently. The most recent are first.

${thoughts.map((t) => `- ${t}`).join("\n")}

Write 2-3 sentences describing what THEY have been circling lately — the thread running through their own thinking. Base it on their notes, not on the articles those notes came from. Address them as "you". Be specific and plain. Return only the sentences, no preamble.`;

  return (await ask(prompt)).trim();
}

/**
 * Find more. The thought leads the message and is labelled as the search
 * intent — when results come back generic it is because the thought is not
 * weighted hard enough, so it goes first and everything else is context.
 *
 * Results are filtered against the URLs web search actually returned, so a
 * constructed or guessed link is dropped rather than shown.
 */
export async function findMore(input: {
  thought: string;
  passage: string;
  articleTitle: string;
  source: string;
}): Promise<Rec[]> {
  const intent = input.thought.trim();

  const prompt = `SEARCH INTENT — this is what to search for, and the only thing that matters:

"${intent || input.passage}"

${
  intent
    ? `That sentence is the reader's own note, written in their own words while reading. It is the primary signal. Find what they were reaching for when they wrote it. Follow the direction of the note, not the subject of the article: if the note is about how a thing is written, search for work on craft; if it asks for underlying evidence, search for the research; if it is about a mechanism, search for that mechanism elsewhere.`
    : `The reader saved this passage without writing a note, so the passage itself is the intent. Results will be weaker than if they had written one.`
}

Do NOT return more coverage of the article's topic. Coverage of the same subject is a failure.

CONTEXT ONLY — do not search for these, they are background:
- Article: ${input.articleTitle || "(untitled)"}
- Source: ${input.source || "(unknown)"}
- Passage they highlighted: ${input.passage}

Use web search, then return ONLY a JSON array of 3-4 results, no prose:
[{
  "title": "exact title of the page",
  "url": "the exact URL as it came back from search — never construct, guess, shorten, or clean up a link",
  "source": "publication or site name",
  "publishedDate": "YYYY-MM-DD if search reported one, otherwise omit this key",
  "why": "one sentence on why this follows THEIR NOTE specifically, referring to what they said"
}]`;

  const { text, sources } = await call(prompt, true);
  const allowed = new Set(sources.map(normaliseUrl));

  const raw = parseJson<unknown[]>(text);
  return raw
    .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
    .map((r) => ({
      title: String(r.title ?? "").trim(),
      link: String(r.url ?? r.link ?? "").trim(),
      source: String(r.source ?? "").trim(),
      publishedDate:
        typeof r.publishedDate === "string" && r.publishedDate.trim() !== ""
          ? r.publishedDate.trim()
          : undefined,
      why: String(r.why ?? "").trim(),
    }))
    .filter((r) => r.title !== "" && r.link.startsWith("http"))
    // A link web search never returned was invented. Drop it.
    .filter((r) => allowed.size === 0 || allowed.has(normaliseUrl(r.link)))
    .slice(0, 4);
}
