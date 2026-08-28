# IA.md

Information architecture. Read with FLOWS.md and DESIGN.md.

---

## Content hierarchy

```
Library
└── Shelf                      topic group, AI-assigned, renameable
    └── Volume                 one source
        ├── metadata           title, author, source, link, dateSaved
        ├── summary            generated at save
        ├── status             unread · unannotated
        ├── spine              gradient family
        ├── Fragment           a passage I highlighted
        │   ├── passage        their words
        │   └── thought        my words ← the primary object
        └── Recommendations    cached results from Find more
```

Three levels deep, maximum. Library → Volume → Fragment.
A user is never more than two taps from any piece of content.

**The load-bearing rule:** the Fragment's *thought* is the primary object in the
whole system. Everything else is context around it. Layout, type scale, and
search behaviour all follow from that.

---

## Navigation model

**App: two screens, one sheet, one panel.**

```
Shelf  ──hover spine──▶  label (my thought)  ──click──▶  Volume  ──▶  Find more
  │                       │
  └──── Add sheet ────────┘
```

No tab bar. No nav drawer. No settings page.
Back always returns to Shelf. There is nowhere else to be.

**Extension: one popup, no navigation.**
States replace each other in place. Nothing pushes, nothing stacks.

---

## Screen contents, in priority order

### Shelf (home)

```
1. Header            "My library" + count and add pills
2. Summary row       three numbers: volumes kept, fragments with a thought,
                     topics forming
3. Interest summary  one short line on what I've been circling lately
4. The collage       every volume as a tilted, floating cover, overlapping
```

Priority is deliberate: the summary sits above the collection because it's the
reason to open the app. Storage is not a reason to open an app.

**A spine shows:** gradient, rotated title, status marker if any.
Nothing else. No source, no date, no count, no preview text — a spine is too
narrow to carry them.

**Hovering a spine raises a label** carrying the title, source, date, and my
thought; clicking opens the Volume. The thought is on the label because a spine
cannot hold it, and because the thought is what should answer "what is this?" —
not the headline someone else wrote.

**Ordering along the line:** shelf groups first, most recently added-to leftmost;
within a group, most recently saved first. The grouping is visible as clustering,
not as labels.

### Volume

```
1. Cover banner        gradient, title, author
1b. Metadata block     source, saved date, tags — label column, value column
2. What it says        the summary
3. What it emphasized  3 key points the article itself pushed, small, secondary
4. What I took         my fragments, thought large, passage small beneath
5. Find more           note-driven results, then recently published on the thread
6. Link to the original
```

Multiple fragments stack chronologically, oldest first — so a volume reads as
a record of my thinking about that source over time.

**3 and 4 sit next to each other on purpose.** The gap between what the article
thought mattered and what I actually pulled out is the reading. On desktop they
are two columns; the key points are the narrower, quieter one.

**Tags sit on the volume, never on a thought.** They are freeform labels added
by hand in the metadata block, deduped case-insensitively, and tapping one
removes it. The thought itself stays open-ended prose — nothing categorises it.

**The article text is never stored.** It is captured at save time, used for the
one enrichment call, and discarded. What survives is the summary, the 3 key
points, and the link.

**A spoken thought keeps its raw transcript.** Cleanup repairs transcription
artefacts only — false starts, fillers, run-on punctuation. Never phrasing, never
tone, never content. "What I actually said" reveals the raw text, so the repair
is always auditable. My words are the asset; the cleanup is repair, not
replacement.

### Add sheet

```
1. Passage field
2. Thought field + mic     "Your thought" (optional)
3. Title / source / link   collapsed, optional
4. Save
```

### Extension popup

```
1. Passage           captured, editable
2. Source line       page title + domain, small
3. Thought + mic     focused on open
4. Save
```

---

## Status vocabulary

Two states, both quiet, both on the spine.

```
unread        saved from a recommendation, not yet read
unannotated   saved without a thought
```

No badges, no counts, no urgency colour. A dot and a subtler marker.
Both clear by engaging, never by a button.

---

## Where the AI sits

Four invisible calls. The user never prompts.

```
On save        → title, author, summary, 3 key points, shelf, cover family
                 (one call, from the captured article text, which is then dropped)
On shelf open  → interest summary (cached, background refresh)
On Find more   → 3-4 results driven by my thought, plus recent on the thread
```

Nothing in the IA is a chat interface. There is no prompt box anywhere in the
product, and that's a deliberate position: the AI organises and extends, it
doesn't converse.

---

## Data flow between the two products

```
Extension  ──save──▶  shared storage  ──read──▶  App
                          │
                          └──▶ /api/claude ──▶ enrichment written back
```

Single source of truth. The extension writes, the app reads and enriches.
The extension never reads the library.

---

## What has no place in the IA

- Search — if you know what you're looking for, you don't need this product
- Folders or manual filing — the AI shelves it
- Settings, accounts, onboarding
- A chat interface
- Reminders or notification centre
