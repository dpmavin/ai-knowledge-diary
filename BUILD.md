# BUILD.md

Context for Claude Code. Read this and DESIGN.md before writing anything.

**Do not build ahead.** Build only the step I ask for, then stop and tell me
what you made and how to check it. Wait for my next prompt.

---

## What this is

A personal reading library. I read constantly across Substack, LinkedIn, Twitter,
Reddit, Medium and papers to keep current in my field. The reading happens, the
retention doesn't — two days later I remember something was good and nothing about
what it said or what I thought.

The fix: when I save something, I say one sentence about why. That sentence is
the product. Everything I save becomes a book on my shelf.

Three parts: a Chrome extension that captures, a web app that holds the library,
and Claude for summarising and recommending.

---

## Data model

```ts
type Volume = {
  id: string
  title: string
  author: string
  link: string
  source: string        // "Substack", "LinkedIn", "Medium"
  dateSaved: string     // ISO
  summary: string       // generated at save time
  shelf: string         // topic grouping
  unread: boolean
  coverFamily: 'ember' | 'clay' | 'dusk' | 'sage' | 'slate'
}

type Fragment = {
  id: string
  volumeId: string
  passage: string       // what I highlighted
  myNote: string        // what I said about it — the important field
  date: string          // ISO
}
```

Rules:
- One Volume per source. Many Fragments inside it.
- Never store the full article. Fragments + summary + link only.
- The summary exists so the substance survives if the source is deleted.

---

## Stack

- Next.js (App Router), TypeScript
- Deployed to Vercel
- localStorage for persistence — no database
- Claude via a serverless route at `/api/claude`, key in `ANTHROPIC_API_KEY`
- Web Speech API for voice input (built into Chrome, no service)
- Chrome extension, manifest v3, loaded unpacked

---

## Build steps

Each is a separate prompt. Don't run ahead.

1. Scaffold + `/api/claude` route
2. Types + seed data + localStorage
3. Shelf view (mobile first)
4. Volume detail view
5. Add-a-save flow inside the app
6. Voice input on the note field
7. Chrome extension
8. Summary + shelf assignment via Claude
9. "Find more" recommendations
10. Responsive desktop pass
11. Deploy

Steps 1–7 are the submission. 8–11 are upside.

---

## The prompts

Paste one at a time. Check it works before moving on.

---

**Step 1**

> Read BUILD.md and DESIGN.md. Build step 1 only, then stop.
> Add a POST route at /api/claude that takes { prompt } and calls the Anthropic
> API with model claude-sonnet-4-6, max_tokens 1000, key from
> process.env.ANTHROPIC_API_KEY. Return the text content as { text }.
> Handle errors and return a clear message on failure. Don't build any UI.

---

**Step 2**

> Build step 2 only, then stop.
> Create lib/types.ts with the Volume and Fragment types from BUILD.md.
> Create lib/seed.ts exporting empty typed arrays.
> Create lib/store.ts with load and save functions that read and write both
> arrays to localStorage under the keys "volumes" and "fragments", falling back
> to seed on first load. Handle SSR — no localStorage access on the server.

---

**Step 3**

> Build step 3 only, then stop.
> Set up Josefin Sans and Inter from Google Fonts and the colour tokens from
> DESIGN.md as CSS variables. Build the shelf view, mobile first at 390px.
> Header: "My library" in Josefin Sans, with a volume count below in metadata style.
> Below it, one row per shelf. Each row has the shelf name as a small uppercase
> label and a horizontally scrolling strip of covers.
> A cover is a 140x180 rounded rectangle filled with a soft radial gradient from
> its coverFamily, with the volume title in Josefin Sans over it and the source in
> small text. Unread volumes get a small dot marker.
> Empty state: "Nothing saved yet" with an Add button.

---

**Step 4**

> Build step 4 only, then stop.
> Tapping a cover opens a full-screen volume view. It shows the cover gradient as
> a banner, the title, author, source, and date, then the summary, then the list
> of fragments.
> For each fragment MY NOTE is the largest text on screen in Josefin Sans, and the
> highlighted passage sits below it, smaller, in Inter, in --mute. This hierarchy
> is the point of the product — never reverse it.
> A link out to the original source. A back control to the shelf.

---

**Step 5**

> Build step 5 only, then stop.
> Add a fixed pill button at the bottom centre reading "Add".
> It opens a sheet with: a passage field, a note field labelled "Why does this
> matter?", and fields for title, source and link.
> On save, create or find the Volume by link, add the Fragment to it, and persist.
> Use a placeholder shelf and a random coverFamily for now — Claude handles those
> in step 8.

---

**Step 6**

> Build step 6 only, then stop.
> Add a microphone button next to the note field using the Web Speech API.
> Pressing it starts listening and streams the transcript into the field as I speak.
> Pressing again stops. Show a clear listening state. If the browser doesn't
> support it, hide the button and leave typing working.

---

**Step 7**

> Build step 7 only, then stop.
> Create an /extension folder with a Chrome manifest v3 extension: manifest.json,
> background.js, popup.html, popup.js. No build step, loadable unpacked.
> When I highlight text and click the extension icon, the popup opens with the
> selected text, page title, and URL already filled in, plus a note field with a
> microphone button using the Web Speech API.
> On save, send it to my web app. Use chrome.storage, and if that's awkward,
> fall back to opening the app in a new tab with the data in query params.
> Keep the popup visually consistent with DESIGN.md but simple.

---

**Step 8**

> Build step 8 only, then stop.
> On save, call /api/claude once to return JSON with: a short title, a 2-sentence
> summary of the passage, a suggested shelf name (reuse an existing shelf if one
> fits), and a coverFamily from the five in DESIGN.md.
> Save optimistically first so the UI never blocks, then update when it returns.
> If the call fails, keep the save with fallback values.

---

**Step 9**

> Build step 9 only, then stop.
> In the volume view add a "Find more" button. It calls /api/claude with the
> web_search tool enabled, passing the passage, MY NOTE, and the source.
> My note drives the search, not the article topic.
> Return 3-4 results as JSON: title, link, one line on why it fits.
> Show them as cards. Each has a save action that creates a new Volume marked
> unread. Cache results on the volume so it never re-fetches during a demo.

---

**Step 10**

> Build step 10 only, then stop.
> Responsive desktop pass. Max content width 1100px centred. Shelf rows become
> grids 4-5 covers wide. Volume view opens as a centred panel rather than full
> width. Don't change any colour, type, or spacing tokens.

---

**Step 11**

> Build step 11 only, then stop.
> Prepare for deploy: check .env.local is gitignored, add a README explaining what
> this is, how to run it, and how to load the extension unpacked. List what
> environment variables Vercel needs.
