# DESIGN.md

Single source of truth for all visual decisions.
Every colour, font size, radius, and spacing value must come from this file.

Reference feel: clean, white, generous whitespace, soft grey surfaces,
pill-shaped controls. All colour lives in the book covers, never in the chrome.

**Mobile first.** Design at 390px, then scale up to desktop.

---

## Colour

### Interface — keep this quiet
```
--ground     #EDEBE8   the app background, under a fixed grain at 3.5% opacity
--page       #FFFFFF   cover frames, cards, sheets — what sits on the ground
--surface    #F4F3F1   cards, panels, inactive tabs
--ink        #0A0A0A   primary text, filled buttons
--mute       #6E6E6B   metadata, secondary text
--hairline   #E8E6E3   1px borders and dividers
--warm       #B0562F   the single brown accent — links, active states, only
```

That's it. No other interface colour. No purple, no blue, no default Tailwind palette.

### Covers — where all colour goes
Every volume gets one of five cover artworks, assigned by shelf. They are images
in `/public/covers`, not CSS gradients — soft blurred mesh gradients, each around
35KB. The hex stops below are each artwork's palette: they document it, they tint
the flip side, and one of them paints the card while the image loads.

```
ember    #E8A06A → #C1502A → #6E2412
clay     #D8B49C → #A46E52 → #5F3A27
dusk     #B3A9DC → #7D6DB4 → #47407A
sage     #C9D4C6 → #8FA592 → #4F6353
slate    #9DB0C4 → #5F7C99 → #33475C
```

Never a flat fill, never a harsh stop. The grain overlay stays, so a cover shares
the paper the page is printed on.

The page carries the same grain at a fraction of the strength — fixed, so it reads
as the paper the page sits on rather than a texture that scrolls with content.

### Spine geometry
```
Width       26–66px, varied per volume
Height      148–258px, varied per volume
Gap         1px — books touch, they are not spaced cards
Radius      4px — a spine is not a card
Baseline    all spines sit on one line, a 1px --hairline shelf edge beneath
Title       Josefin Sans 20px, rotated, reading top to bottom
```

Wide variation on both axes is what makes a row read as a shelf rather than a
chart of equal bars. It must be deterministic per volume — the same volume is
always the same size — never random.

Spines narrower than 38px carry no title: Josefin's 20px floor will not fit, and
a thin book shows nothing legible on a real shelf either.

---

## Type

```
Display / titles / my notes   Josefin Sans   (Google Fonts)
Body / passages / UI          Inter          (Google Fonts)
```

Josefin Sans is a display face. Use it at 20px and above only —
below that it gets hard to read. All body text, buttons, and metadata are Inter.

### Scale (mobile)
```
Screen title     Inter          19px   medium — the app's own chrome
Page title       Josefin Sans   32px   light (300) — on a cover banner
Volume title     Josefin Sans   20px   regular — on a cover, on a result card
My thought       Josefin Sans   22px   light, 1.4 line height
Passage          Inter          15px   regular, --mute
Key point        Inter          15px   regular, --mute — the article's words too
Metadata         Inter          12px   uppercase, 0.08em tracking, --mute
Button           Inter          15px   medium
```

Scale up 1.25x from 768px: 19→24, 32→40, 20→25, 22→28, 15→19, 12→15.
Nothing else changes. Any size not derived from this table is a bug.

### The hierarchy rule — do not break this
On any card, MY THOUGHT is the largest text, in Josefin Sans.
The original passage sits below it, smaller, in Inter, in --mute.
This inversion is the point of the product.

---

## Shape

```
Buttons          fully rounded pill (border-radius: 999px)
Cards / panels   16px
Spines           4px, top corners only — a book meets the shelf square
Volume banner    20px
Inputs           999px
```

Filled button: --ink background, white text.
Outline button: white background, --hairline border, --ink text.
Covers in the collage float: 0 10px 24px rgba(10,10,10,0.12). That is the only
shadow in the product. Everywhere else, separation comes from --surface, --page,
and --hairline.

---

## Layout

Fully responsive, and desktop is the screen that matters — it is where the work
gets reviewed. One fluid layout from 320px up; no phone frame, no fixed column.
Content is capped at 1100px and centred, and the covers grid fills whatever width
it is given, so a wide screen shows a long row rather than a narrow stack.

### Mobile
- 20px page margins
- Covers 200x280 in a loose staggered column — never a grid. Each is tilted
  between -4 and +4 degrees, deterministic per volume so it never re-tilts on
  re-render. Cards at the extremes run past the column edge and clip, so the
  collection visibly continues.
- Header centred: "My library", then a pill row — volume count and add
- Cover face: gradient, grain, and a soft inner edge (a 1px white top highlight,
  a 1px ink hairline, and a lifted bottom shade) so it reads as an object rather
  than a flat swatch
- Title in Josefin Sans bottom left, source in metadata caps beneath it
- Home: one continuous shelf holding every volume, standing on a 1px --hairline
  line, aligned to one baseline, touching at a 1px gap, scrolling horizontally.
  Not one row per shelf — shelves order the line so a topic clusters.
- Spines: 34-58px wide and 152-210px tall on mobile, 50-82px and 262-364px from
  768px. Varied per volume, deterministic — a volume never changes width.
- A spine is its cover seen edge-on: the same artwork running edge to edge, with
  the same grain. It is built as a book — a 5px page block down one edge with a
  dark rule against it, a lit top edge, and a hinge line where the cover folds.
- Title in Josefin 16px, rotated, reading top to bottom.
- Rows scroll horizontally once a shelf outgrows the width.
- Hover a cover → it flips to my thought on the back; click → full-screen volume view
- One fixed pill button, bottom centre: "Add"

### Desktop (from 768px)
- Max content width 1100px, centred, 40px margins
- Volume screen capped at 720px so prose keeps a readable measure
- Covers 240x336 in a wider scatter — the same loose staggered logic, spread
  across the column instead of stacked down it
- Volume view opens as a centred 680px panel, not full width

Both layouts ship as CSS custom properties on every card and a media query picks
one. Never detect width in JavaScript — it costs a hydration flash.

---

## Motion

Two, and only two, both making a flat rectangle behave like an object.

**Pull** — hovering a book lifts it 12px off the shelf line and holds it there:
420ms on cubic-bezier(.34, 1.8, .5, 1), so it overshoots and settles rather than
sliding. A card opens above it carrying the title, source, date, and my thought.
The card is where the thought lives now: a spine is too narrow to hold it, and
books near either end anchor their card to that edge so it never clips.

**Tilt** — a related-items card leans toward the cursor, max 7 degrees, spring
220/26. From ibelick/motion-primitives (MIT), vendored at
`components/motion/tilt.tsx`.

Nothing else animates. A card never does both.

The flip is the product's argument made physical: the object you keep is the
thought, and the article is only its face. Respect prefers-reduced-motion.

---

## Never
- Drop shadows anywhere except a floating cover in the collage
- Gradients anywhere except spines and the volume banner
- Any colour outside the tokens above
- Icon libraries. A hand-drawn inline SVG is allowed where a mark reads faster
  than a word — a back arrow, a microphone — but it is always drawn here, never
  installed, and it never replaces a label that was doing the work
- Josefin Sans below 20px
- The passage or a key point set larger than my thought
