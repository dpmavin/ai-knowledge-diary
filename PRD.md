# Library — PRD

Save what mattered from what you read. Say why. It becomes a book on your shelf.

---

## The friction

Keeping current is part of my job. As a designer I read constantly outside work —
Substack, LinkedIn, Twitter, Reddit, Medium, papers — to stay on top of where AI
and design are going.

The reading happens. The retention doesn't.

Two days later I remember that something was good and nothing about what it said,
or what I thought about it. So the reading produces no compounding value.
I consume a lot and hold almost none of it.

**This isn't a memory problem. It's a capture problem.**
Nothing in my workflow ever asks me to articulate what I just took from something.
And articulating is the part where learning actually happens.

---

## Why it's a need, not a nice-to-have

A nice-to-have has no consequence when skipped. This one does.

In my field, having a point of view on what's shifting is the job.
It shows up in interviews, in critique, in whether I'm taken seriously.
I already read enough to have that view. What fails is that none of it survives
long enough to be usable when it counts.

Retention is the job. Right now mine is close to zero.

---

## How the workflow is solved

**Today**
read → bookmark → never return → the thought I had is gone within hours

**With this**
read → highlight → speak one sentence → done

The one sentence is the whole mechanism. It takes three seconds and it's the
moment the learning sticks. Everything after it — summarising, grouping,
cover, shelf — happens without me.

**Where the speed comes from**

- Voice, not typing. A spoken thought costs 3 seconds, a typed one costs 30.
  That gap is the difference between a tool I use and one I abandon.
  (Also: I can't type right now. The constraint produced the better default.)
- One click to save, one sentence to keep it. No forms, no tagging, no filing.
- Organisation is automatic. I never sort anything.
- Going deeper is automatic. The trip I never take gets made for me.

**The quality-over-quantity mechanism**

Every save costs a sentence of real thought.
You can't save fifty things a day at that price.
The friction is the feature — over-consumption is throttled by design.

---

## Who it's for

Primary: me. Built honestly for my own reading habit.

Extends to anyone whose work assumes they stay current —
designers, researchers, PMs, engineers, students.
The condition is the same everywhere: high input, near-zero retention,
and no moment in the workflow that asks you to think.

Why it helps others: articulation is how anyone learns, and no tool
in this space requires it. They all optimise for saving faster.
This one optimises for saving *better*, and fewer.

---

## The loop

1. **Save** — highlight anything on the web, click the extension, speak your thought
2. **Keep** — it summarises, titles, and files it as a volume on a shelf
3. **Extend** — open a volume, tap "find more", get 3–4 things that take your
   thought further (not the article's topic — *your* note drives it)
4. **Grow** — save any of those straight to the shelf, marked unread

Same post + "I want the underlying research" → the paper.
Same post + "I like how this is written" → something on craft.
Your note steers it. That's the demo moment.

---

## Scope

**In**

- Chrome extension: highlight → popup → voice or typed note → save
- Auto summary + title at save time
- Volumes (one source) holding fragments (highlights + notes)
- Shelves: AI-suggested topic groups, renameable
- Generated SVG covers inside a design system I define
- Detail view: my note first, original passage second
- "Find more" recommendations via Claude with web search
- Unread status (not reminders — see below)

**Out — say in the video as next steps**

- Push notifications / reminders. Deliberate: the problem was never that I forgot,
  it was that going back wasn't worth it. A nag reintroduces the model I rejected.
  Instead: an `unread` flag visible on the shelf.
- PDF upload, read-later queue, sync, mobile app, NFC tags on physical books

---

## Data model

```
Volume   = one source
           title, author, link, dateSaved, summary, cover, shelf, unread

Fragment = one highlight inside a volume
           passage, myNote, date

Shelf    = topic grouping of volumes
```

Never store the full post. Fragments + summary + link.
The summary is insurance: if the post is deleted, the substance survives.

---

## Stack

- **Web app** — Next.js, deployed on Vercel
- **Extension** — Chrome manifest v3, 3 files, loaded unpacked for the demo
- **AI** — Claude API via serverless route: summary, shelf, cover spec, recommendations
- **Voice** — Web Speech API (built into Chrome, no service needed)
- **Storage** — localStorage for the demo

---

## The moat

Capture is a commodity. Readwise, Glasp, Web Highlights, Notion's clipper all do it,
and Mem's Copilot already surfaces saved notes while you work (~$12–15/mo).

Four things they don't do:

**1. My note is the artifact.** Every tool makes the passage primary and the
annotation secondary. Inverting that is the design position: anyone can re-find
the article, nobody can recover what I thought while reading it.

**2. Voice-first capture.** Every tool has a note field. They're all empty,
because nobody stops mid-read to type. Speaking is the only way annotation
actually happens.

**3. It survives the source.** Summary at save time. Post deleted, account private,
link rotted — the substance stays.

**4. It looks like something I own.** 200 saves is debt. Eight books on a shelf is
a collection. Same data, opposite feeling. Covers generated inside a system I
designed — the AI picks colour and motif, it doesn't design.

---

## The four questions

**Is this stopping a real friction?**
Yes. Chronic, not acute. Nothing goes wrong on any single day — the cost shows up
over months as constant consumption with nothing retained.

**What friction exactly?**
The gap between reading something valuable and having anything left from it
two days later.

**How does it simplify the workflow?**
Five steps to one. Highlight, speak a sentence, done.

**Will I actually use it?**
The test is whether saving costs less than the value of keeping it.
Three seconds of speech is under the bar. A form wouldn't be.

---

## Demo path

1. Open the live app → shelf of real volumes with generated covers
2. Tap one → my highlights, my notes, my thinking
3. Tap "find more" → recommendations driven by my note
4. Load the extension → highlight anything on Medium → speak a thought → save
5. Back to the app → new volume on the shelf

Under two minutes. Nothing faked.

---

## Build order

1. Web app: shelf + seeded real data ← this alone is a demo
2. Volume detail view
3. Extension: highlight → popup → note → save
4. Voice input
5. "Find more" recommendations
6. Generated covers
7. Deploy + repo

If time runs out, 1–4 is the submission.

---

## Starter prompt for Claude Code

> I'm building a personal reading library in Next.js, deploying to Vercel.
>
> Data model:
> - Volume: one source. Fields: id, title, author, link, dateSaved, summary, shelf, unread, coverSpec
> - Fragment: a highlight inside a volume. Fields: id, volumeId, passage, myNote, date
> - Shelf: a topic string on the volume
>
> Build in this order, and stop after each step so I can check it:
>
> **Step 1.** Scaffold a Next.js app called `library`. Single page.
> Add an API route at `/api/claude` that takes a prompt string and calls the
> Anthropic API (model `claude-sonnet-4-6`, max_tokens 1000), key from
> `ANTHROPIC_API_KEY`. Return the text content.
>
> **Step 2.** Create `lib/seed.ts` with an empty array typed to the model above.
> Load volumes from localStorage on mount, falling back to seed.
>
> **Step 3.** Build the shelf view. Volumes render as vertical book spines in a
> horizontal row, serif type, quiet off-white background, title rotated on the
> spine. Hovering shows a detail card. Header reads "Welcome to my library" with
> a volume count. Shelves render as separate rows with the shelf name as a label.
>
> **Step 4.** Build the volume detail view. Opening a spine shows the volume's
> fragments. For each fragment, MY NOTE is the large primary text and the original
> passage sits smaller and secondary beneath it. Show source, link, and date.
>
> Don't build the extension or recommendations yet.

Paste your 20 real saves into `lib/seed.ts` after step 2.
The demo is only as good as that data.
