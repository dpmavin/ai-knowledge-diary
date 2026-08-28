# FLOWS.md

Two products. The extension captures. The app holds and extends.

Single user, one device, no accounts, no sharing.

---

# PRODUCT 1 — THE EXTENSION

Job: get a passage and my thought into the library in under 10 seconds, then disappear.
It never shows the library. If you can browse from here, it's doing too much.

## States

```
A. Ready         passage captured, thought empty
B. Listening     mic active, transcript streaming
C. Saving        brief, ~1s
D. Saved         confirm, auto-close
E. No selection  nothing highlighted
```

## Flow E1 — Save a highlight (core flow)

```
Reading on Substack / LinkedIn / Medium / Reddit
  ↓
Highlight a passage
  ↓
Click extension icon
  ↓
STATE A
  ├─ passage at top, scrollable if long, editable
  ├─ source + page title beneath, small
  └─ "Your thought" — focused
      placeholder: interpretation, reaction, what you'd use it for…
  ↓
  ├─ Tap mic → STATE B → speak → transcript fills live → tap to stop
  ├─ Or type
  └─ Or skip it
  ↓
Save (always enabled)
  ↓
Written to storage immediately → STATE D → closes ~1s
  ↓
[background] Claude returns title, author, summary, 3 key points, shelf, cover
```

**The thought is optional but never invisible.**
Saved without one → the volume is marked *unannotated* on the shelf.
Not a block, not a nag. Just visible: you kept this but never said why.

**Rules**
- Save never waits on Claude. Optimistic write, enrich after.
- The extension also grabs the page's main article text — largest text block,
  nav/ads/comments stripped — and sends it with the passage. It is held only
  until the enrichment call returns, then discarded. Never stored.
- A spoken thought is cleaned of transcription artefacts only. The raw transcript
  is kept beside it and revealed on tap.
- The thought is open-ended: interpretation, reaction, intended use, a question.
  Never a category picker.
- Target: under 10 seconds, two taps with voice.

## Flow E2 — Nothing highlighted

```
Click icon, no selection
  ↓
STATE E — "Highlight something first"
  └─ Or "Save the whole page" → title + URL only
```

## Flow E3 — While capturing

```
STATE A
  ├─ Passage editable — trim an over-grab
  ├─ Mic re-runnable — second recording replaces, doesn't append
  └─ Escape or click-away closes, nothing persists
```

## The mic — interactive detail

```
Idle         outline, "Speak your thought"
Pressed      solid fill, "Listening…", subtle pulse
Speaking     transcript appears live, editable after
Stopped      back to idle, text stays and can be edited
Denied       mic hidden, typing works, one-line note
Unsupported  same as denied
```

## Extension edges

- Same URL already saved → adds a Fragment, no duplicate Volume
- Claude fails → save persists, fallback title, shelf "Unsorted"
- Offline → saves locally, enriches next app open
- Very long passage → capped in display, full text stored

---

# PRODUCT 2 — THE APP

Job: hold the library, make returning worth it, take a thought further.

## Screens

```
1. Shelf         home
2. Volume        one source and my thoughts inside it
3. Add sheet     manual capture fallback
4. Find more     results panel inside Volume
```

## Flow A1 — First open (empty)

```
Open app
  ↓
Empty state — one line explaining what this is
  ├─ "Add manually" → Flow A3
  └─ Extension hint → Flow E1
```

A reviewer lands here first. This line carries the whole idea.

## Flow A2 — Shelf view

```
Open app
  ↓
Header: "My library" + volume count
  ↓
INTEREST SUMMARY — one short line, directly below the header
  ├─ what I've been circling lately
  ├─ written from MY THOUGHTS, not from the articles
  ├─ scoped to recent saves, not all time
  └─ cached; regenerates in background on new saves
  ↓
Shelf rows — grouped by AI, renameable
  ├─ covers as gradients, title over the gradient
  ├─ unread volumes carry a dot
  └─ unannotated volumes carry a quieter marker
  ↓
Tap a cover → Volume view
```

The summary is the first thing seen on open. It gives the shelf a reason to
exist beyond storage.

## Flow A3 — Volume view

```
Volume
  ├─ cover banner, title, author, source, date
  ├─ summary
  ├─ fragments — MY THOUGHT large, passage small beneath
  │    └─ if no thought: passage alone, with "Add a thought" affordance
  ├─ link to original
  └─ "Find more"
```

**Rule:** the thought is always the largest text. Never the passage.

## Flow A4 — Add manually

For a paper book, a PDF, a conversation.

```
Tap "Add"
  ↓
Passage → thought (voice or typed, optional) → optional title / source / link
  ↓
Save → same enrichment path as the extension
```

## Flow A5 — Find more

```
Volume → "Find more"
  ↓
Claude searches using MY THOUGHT, not the article topic
  ↓
3-4 results: title, source, one line on why it fits
  ↓
Tap save → new Volume, marked unread
  ↓
Cached on the volume — never re-fetches
```

Same post + "I want the underlying research" → the paper
Same post + "I like how this is written" → something on craft

If there's no thought, it falls back to the passage. Weaker results —
which is itself an argument for annotating.

**Edges**
- Cached → instant, refresh available
- Fails → inline message, volume unaffected
- Already saved → "Already saved" replaces the action

## Flow A6 — Unread

```
Shelf → unread volume (dot)
  ↓
Volume view — summary and link, no fragments yet
  ↓
Open original → read → save a fragment → dot clears
```

Clears by engaging, not by a button. No reminders.

---

# DEMO PATH

1. Live app → interest summary + shelf of real volumes
2. Tap one → my thoughts, my thinking
3. "Find more" → recommendations shaped by my thought
4. Load extension → highlight on Medium → speak a thought → save
5. Back to app → it's on the shelf

Under two minutes. Nothing faked.

**Deployment note:** the 20 real saves ship as the seed file, not as
localStorage data — otherwise reviewers open an empty library.

---

# DELIBERATELY ABSENT

- Onboarding, accounts, settings
- Reminders and notifications
- Search — if you know what you're looking for, you don't need this
- A library view inside the extension
- Manual filing beyond renaming a shelf
- Categories or tags on the thought itself — it stays open-ended prose
  (tags exist, but on the volume, in the metadata block)
