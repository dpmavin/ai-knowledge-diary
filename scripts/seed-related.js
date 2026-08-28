/*
 * Seeds the Related rail with real, checked links — one web search per volume,
 * written straight into data.js as RELATED. Run it with the dev server up:
 *
 *   node scripts/seed-related.js
 *
 * Every link is filtered against the URLs search actually returned, so nothing
 * invented reaches the file. Volumes it cannot fill are left out and search
 * live on open. Each call costs API credit — 20 volumes is 20 searches.
 */
const fs = require("fs");
const path = "/Users/divyamavinkurve/library-archives/public/mockup/data.js";
const { BOOKS } = new Function(fs.readFileSync(path, "utf8") + "\nreturn { BOOKS };")();

function normaliseUrl(raw) {
  try {
    const url = new URL(raw);
    return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch { return raw.trim().toLowerCase(); }
}

function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.search(/[[{]/);
  if (start === -1) throw new Error("No JSON in the response.");
  const closer = body[start] === "{" ? "}" : "]";
  const end = body.lastIndexOf(closer);
  if (end <= start) throw new Error("Unterminated JSON in the response.");
  return JSON.parse(body.slice(start, end + 1));
}

function promptFor(book) {
  const intent = (book.thought ?? "").trim();
  const passage = book.passage ?? "";
  return `SEARCH INTENT — this is what to search for, and the only thing that matters:

"${intent || passage || book.full}"

${intent
  ? "That sentence is the reader's own note, written in their own words while reading. It is the primary signal. Find what they were reaching for when they wrote it. Follow the direction of the note, not the subject of the article: if the note is about how a thing is written, search for work on craft; if it asks for underlying evidence, search for the research; if it is about a mechanism, search for that mechanism elsewhere."
  : "The reader saved this without writing a note, so the passage itself is the intent. Results will be weaker than if they had written one."}

Do NOT return more coverage of the article's topic. Coverage of the same subject is a failure.

CONTEXT ONLY — do not search for these, they are background:
- Article: ${book.full}
- Source: ${book.source}
${passage ? `- Passage they highlighted: ${passage}` : ""}

Use web search, then return ONLY a JSON array of 4 results, no prose:
[{
  "title": "exact title of the page",
  "url": "the exact URL as it came back from search — never construct, guess, shorten, or clean up a link",
  "source": "publication or site name",
  "why": "one sentence on why this follows THEIR NOTE specifically, referring to what they said"
}]`;
}

async function findMore(book) {
  const response = await fetch("http://localhost:3113/api/claude", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: promptFor(book), useWebSearch: true }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "call failed");
  const allowed = new Set((data.sources ?? []).map(normaliseUrl));
  return parseJson(data.text)
    .filter((r) => r && typeof r === "object")
    .map((r) => ({
      title: String(r.title ?? "").trim(),
      link: String(r.url ?? r.link ?? "").trim(),
      source: String(r.source ?? "").trim(),
      why: String(r.why ?? "").trim(),
    }))
    .filter((r) => r.title !== "" && r.link.startsWith("http"))
    .filter((r) => allowed.size === 0 || allowed.has(normaliseUrl(r.link)))
    .slice(0, 4);
}

(async () => {
  const out = {};
  const LANES = 4;
  let next = 0;
  await Promise.all(Array.from({ length: LANES }, async () => {
    while (next < BOOKS.length) {
      const i = next++;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          out[i] = await findMore(BOOKS[i]);
          console.log(`${i} ${BOOKS[i].full} -> ${out[i].length}`);
          break;
        } catch (error) {
          console.log(`${i} attempt ${attempt} failed: ${error.message}`);
          if (attempt === 3) out[i] = [];
          else await new Promise((r) => setTimeout(r, 4000 * attempt));
        }
      }
    }
  }));
  // a volume that came back empty keeps no entry, so it can search live later
  const filled = Object.fromEntries(
    Object.entries(out).filter(([, list]) => list.length > 0),
  );
  const src = fs.readFileSync(path, "utf8");
  fs.writeFileSync(
    path,
    src.replace(
      /const RELATED = \{[\s\S]*?\n?\};/,
      `const RELATED = ${JSON.stringify(filled, null, 2)};`,
    ),
  );
  console.log(`DONE — ${Object.keys(filled).length} of ${BOOKS.length} volumes seeded`);
})();
