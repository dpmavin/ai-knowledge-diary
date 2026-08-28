# My Knowledge Diary

A personal reading archive. Highlight a paragraph, say one sentence about why it
mattered, and it becomes a book on your shelf.

The reading happens; the retention doesn't. Two days later you remember something
was good and nothing about what it said or what you thought. Every tool makes the
article primary and your annotation secondary — this one inverts that. Your
sentence is the largest text on every screen, and it's what the archive searches
with when it goes looking for more.

## The two halves

**`extension/`** — a Chrome extension, manifest v3, no build step. Highlight,
click the flower, speak a sentence, save. It never shows the library.

**the app** — Next.js. `public/mockup/` is the shelf and volume pages the
extension saves into; `app/` holds the API routes they call.

They meet through the browser: the popup writes a save into the app's own origin,
or leaves it in `chrome.storage` for `bridge.js` to hand over the next time the
shelf is opened. Saving never navigates you away from what you were reading.

## Running it

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev -- -p 3113
```

Then open **http://localhost:3113/mockup/home.html**.

### The extension

1. `chrome://extensions` → turn on **Developer mode**
2. **Load unpacked** → select the `extension/` folder
3. Pin it, then click the mic once and choose **Enable the microphone** — a popup
   can't show Chrome's permission prompt itself, so it opens a tab that can

`extension/config.js` holds the one constant that points the extension at the
app. Change it before packaging for anyone else, and match it in `manifest.json`
under `host_permissions` and `content_scripts[0].matches` — the popup checks the
two agree at startup and says so if they drift.

## Where the AI sits

Four calls, none of them a chat box you have to prompt.

| | |
|---|---|
| On save | title, summary, key points, shelf, cover family |
| Find more | 3–4 links driven by **your note**, not the article's topic |
| Knowledge LLM | ask the archive itself, grounded strictly in what you saved |
| On shelf open | what you've been circling lately, written from your sentences |

`scripts/seed-related.js` fills the Related rail once and writes the results into
`public/mockup/data.js`, so the shelf paints instantly and only a brand-new save
spends a search.

**Grounding is enforced server-side** in `app/api/ask/route.ts`. The material sent
with the request is the entire world; if it doesn't cover the question the answer
is "your archive doesn't have anything on that" and nothing more. Counts are
counted from the data, never estimated.

## Environment

| Variable | Where | Why |
|---|---|---|
| `ANTHROPIC_API_KEY` | `.env.local`, and Vercel's project settings | every AI call |

`.env*` is gitignored.

## The documents

`DESIGN.md` is the single source of truth for every visual decision. `FLOWS.md`
is the interaction spec, `IA.md` the information architecture, `PRD.md` the
product intent, `BUILD.md` the build plan.
