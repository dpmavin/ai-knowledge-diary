/* Palette, grain, and the contrast maths. Used by both pages. */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")";

const PALETTE = [
  "#2A3550", "#D9C9B6", "#9C3B34", "#E3BFC4", "#C08A3E",
  "#7A3450", "#4A2740", "#33415C", "#3F7A6E", "#A8B79A",
  "#EFE7D6", "#8FAAC0", "#22262E", "#E6D79A", "#C77A72",
  "#4E6E97", "#C0623C", "#7C6A9C", "#2F5D5A", "#CBD3C6",
];

/**
 * A book's text can come from any page the extension was clicked on, and
 * several of these views build their markup as strings. Escaping at the point
 * of interpolation is what stops a page title carrying markup onto the shelf.
 */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// --- contrast ------------------------------------------------------------

function channel(v) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminance([r, g, b]) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
/** Composite a translucent ink over the jacket before measuring it. */
function over(fg, alpha, bg) {
  return fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));
}
function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
/**
 * The smallest alpha of `base` over `fill` that still clears the target ratio.
 * Fixed alphas collapse on mid-tone brights, so each jacket solves its own.
 */
function solveAlpha(base, fill, target = 4.5) {
  for (let a = 0.5; a <= 1.001; a += 0.02) {
    if (ratio(over(base, a, fill), fill) >= target) return Math.min(a, 1);
  }
  return 1;
}

/**
 * The same colour a few shades down — for artwork that should read as tone on
 * the jacket rather than as a second ink competing with the title. A jacket
 * already at the bottom of its range has nowhere darker to go, so it lifts.
 */
function shade(hex, amount = 0.2) {
  const fill = rgb(hex);
  const toward = luminance(fill) < 0.06 ? 255 : 0;
  return `rgb(${fill.map((c) => Math.round(c + (toward - c) * amount)).join(",")})`;
}

/** Type colour is decided by measured contrast, never by eye. */
function inkOrWhite(hex) {
  const fill = rgb(hex);
  const dark = ratio(over([10, 10, 10], 0.86, fill), fill);
  const light = ratio(over([255, 255, 255], 0.95, fill), fill);
  return light > dark
    ? { dark: false, title: "rgba(255,216,255,.95)", contrast: light }
    : { dark: true, title: "rgba(10,10,10,.86)", contrast: dark };
}


/* ---------------------------------------------------------------------------
 * Edited sentences. Kept in localStorage so a change made on a volume page is
 * there when you come back to the shelf — the sentence is the product, so it
 * should not evaporate on navigation.
 * ------------------------------------------------------------------------ */
const EDITS_KEY = "journal-edits";

function loadEdits() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(EDITS_KEY) ?? "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

/** A patch, so a sentence and a tag can be edited independently. */
function saveEdit(index, patch) {
  const edits = loadEdits();
  edits[index] = { ...(edits[index] ?? {}), ...patch };
  try {
    window.localStorage.setItem(EDITS_KEY, JSON.stringify(edits));
  } catch {
    // private mode — the in-memory copy is still correct
  }
}

/** The library with any edits applied. */
function withEdits(list) {
  const edits = loadEdits();
  return list.map((book, i) => {
    const patch = edits[i];
    // an older store kept a bare string; treat it as the sentence
    if (typeof patch === "string") return { ...book, thought: patch };
    return patch ? { ...book, ...patch } : book;
  });
}

/* ---------------------------------------------------------------------------
 * Books added after the seed — from the extension, or from the Save a link
 * sheet. They are kept beside the seed rather than merged into it, so data.js
 * stays the library as it shipped and an added book can never overwrite one.
 * ------------------------------------------------------------------------ */
const ADDED_KEY = "journal-added";
const INBOX_KEY = "librarySaves";

function loadAdded() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(ADDED_KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveAdded(list) {
  try {
    window.localStorage.setItem(ADDED_KEY, JSON.stringify(list));
  } catch {
    // private mode — this session still has the books in memory
  }
}

/** Deterministic, so a book never changes width between renders. */
function sizeFor(key) {
  let seed = 0;
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  return { width: 56 + (seed % 18), height: 210 + ((seed >>> 5) % 31) };
}

/**
 * A volume holds many fragments — one per highlight. The seed carries a single
 * passage and thought at the top level, so normalising here means data.js never
 * has to change and everything downstream can assume the array is there.
 */
function fragmentsOf(book) {
  if (Array.isArray(book.fragments)) return book.fragments;
  return [{
    passage: book.passage ?? "",
    thought: book.thought ?? "",
    date: "",
  }];
}

function isBlank(fragment) {
  return fragment.passage.trim() === "" && fragment.thought.trim() === "";
}

function toFragment(save) {
  return {
    passage: (save.passage || "").trim(),
    thought: (save.thought || "").trim(),
    date: save.savedAt || new Date().toISOString(),
  };
}

/** One volume per source, so a second highlight is not a second book. */
function toBook(save) {
  const title = (save.title || "Untitled").trim();
  return {
    short: title.length > 16 ? `${title.slice(0, 15)}…` : title,
    full: title,
    source: save.source || "Saved by hand",
    theme: save.tag || "Miscellaneous",
    ...sizeFor(title + (save.link ?? "")),
    unread: false,
    summary: "", // no enrichment call yet, and the section hides when empty
    points: [],
    link: save.link || "",
    fragments: [toFragment(save)],
  };
}

/**
 * The shelf shows one sentence per volume even when it holds several, so the
 * spine and its card carry the first thought actually written.
 */
function normalise(book) {
  const fragments = fragmentsOf(book);
  const said = fragments.find((f) => (f.thought ?? "").trim() !== "");
  return {
    ...book,
    fragments,
    thought: said ? said.thought : "",
    passage: fragments[0] ? fragments[0].passage : "",
  };
}

function addBook(save) {
  const list = loadAdded();
  list.push(toBook(save));
  saveAdded(list);
}

/**
 * The extension queues saves in this origin's localStorage — an extension
 * context cannot reach the page's own store, so it writes the queue here and
 * the shelf turns it into books. Draining is destructive on purpose: a save
 * becomes a book exactly once.
 */
function drainInbox() {
  let queue = [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(INBOX_KEY) ?? "[]");
    if (Array.isArray(raw)) queue = raw;
  } catch {
    queue = [];
  }
  if (queue.length === 0) return 0;

  const added = loadAdded();
  // edits applied, so a volume that already grew a fragment keeps them all
  const seeded = withEdits(BOOKS);

  /** Where this link already lives on the shelf, in true-index terms. */
  function findVolume(link) {
    if (!link) return -1;
    const inSeed = seeded.findIndex((b) => b.link === link);
    if (inSeed !== -1) return inSeed;
    const inAdded = added.findIndex((b) => b.link === link);
    return inAdded === -1 ? -1 : BOOKS.length + inAdded;
  }

  let kept = 0;
  for (const save of queue) {
    const fragment = toFragment(save);
    const at = findVolume(save.link);

    if (at === -1) {
      added.push(toBook(save));
      kept += 1;
      continue;
    }

    /*
     * The same page again. This used to be dropped on the floor while the
     * popup said it had saved — a second highlight is another fragment inside
     * the volume you already have, never a second book and never nothing.
     */
    const book = at < BOOKS.length ? seeded[at] : added[at - BOOKS.length];
    const current = fragmentsOf(book);
    // a volume saved as a whole link has an empty slot; fill it rather than
    // leaving a blank card above the real one
    const next =
      current.length === 1 && isBlank(current[0])
        ? [fragment]
        : current.concat(fragment);

    if (at < BOOKS.length) {
      seeded[at] = { ...book, fragments: next };
      saveEdit(at, { fragments: next });
    } else {
      book.fragments = next;
    }
    kept += 1;
  }

  saveAdded(added);
  try {
    window.localStorage.removeItem(INBOX_KEY);
  } catch {
    // nothing to clear
  }
  return kept;
}

/** The shelf as it stands: what shipped, what was added, edits applied. */
function library() {
  drainInbox();
  return withEdits(BOOKS.concat(loadAdded())).map(normalise);
}

/* ---------------------------------------------------------------------------
 * Dictation. The sentence is the product and nobody types one mid-read, so
 * "Speak it" is real speech recognition, not a simulation.
 * ------------------------------------------------------------------------ */
function createDictation({ field, button, label }) {
  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  if (!Recognition) {
    button.disabled = true;
    button.title = "This browser has no speech recognition";
    return { stop() {} };
  }

  let engine = null;
  let listening = false;

  function setLabel(text) {
    if (label) label.textContent = text;
  }

  function stop() {
    engine?.stop();
    listening = false;
    button.setAttribute("aria-pressed", "false");
    setLabel("Speak it");
  }

  button.addEventListener("click", () => {
    if (listening) return stop();

    engine = new Recognition();
    engine.continuous = true;
    engine.interimResults = true;
    engine.lang = "en-US";

    engine.onresult = (event) => {
      // rebuilt each time: a second recording replaces, never appends
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      field.value = transcript.trim();
    };
    engine.onend = stop;
    engine.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setLabel("Mic blocked");
        button.disabled = true;
      }
      stop();
    };

    try {
      engine.start();
    } catch {
      stop();
      return;
    }
    listening = true;
    button.setAttribute("aria-pressed", "true");
    setLabel("Listening");
  });

  return { stop };
}

/* ---------------------------------------------------------------------------
 * The interest summary, read off the shelf itself. Written from the sentences
 * the reader wrote, never from the articles — so it changes the moment a book
 * is added or a note is edited.
 * ------------------------------------------------------------------------ */
const STOPWORDS = new Set(
  ("the a an and or but of to in on for is it its was were be been that this these those " +
   "you your i my me we our they them he she his her as at by from with without into out " +
   "up down not no yes so than then there here what which who whom when where why how all " +
   "any both each few more most other some such only own same too very can will just dont " +
   "don't isnt isn't im i'm youve you've thats that's about after again against because " +
   "before being below between during further having if into once over same under until " +
   "while what's whats one two three make makes made keep keeps kept thing things way ways " +
   "whole second first another every everything something anything nothing someone people " +
   "within becomes become always never still again enough actually really better best worse " +
   "worst good long much many even also like used using take takes taken give gives given " +
   "come comes came know knows knew think thinks thought said says say " +
   "nobody anybody everybody somebody would could should must might does doing " +
   "gets getting goes going want wants need needs back over than shape")
    .split(" "),
);

function termsIn(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z' ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOPWORDS.has(w));
}

/** Singularise crudely — "interfaces" and "interface" are the same circling. */
function stem(word) {
  return word.replace(/(ies)$/, "y").replace(/s$/, "");
}

function interestSummary(list) {
  const said = list.filter((b) => b.thought && b.thought.trim() !== "");
  if (said.length === 0) {
    return "Nothing said yet. Save something and tell me why it mattered.";
  }

  // how many separate notes each term appears in — notes, not occurrences,
  // so one long note cannot invent a preoccupation on its own
  const counts = new Map();
  const examples = new Map();
  const surface = new Map(); // stems are for counting; show the word as written
  for (const book of said) {
    const seen = new Set();
    for (const word of termsIn(book.thought)) {
      const key = stem(word);
      if (!surface.has(key)) surface.set(key, word);
      if (seen.has(key)) continue;
      seen.add(key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (!examples.has(key)) examples.set(key, book.thought);
    }
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [term, times] = ranked[0] ?? ["", 0];

  // which shelf holds most of the thinking
  const byTheme = new Map();
  for (const book of said) {
    byTheme.set(book.theme, (byTheme.get(book.theme) ?? 0) + 1);
  }
  const [theme, themeCount] = [...byTheme.entries()].sort((a, b) => b[1] - a[1])[0];

  const sentences = [];

  if (times > 1) {
    // the quote carries its own full stop; do not end up with two
    const quote = examples.get(term).replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "");
    sentences.push(
      `You keep circling ${surface.get(term) ?? term}, and it turns up in ${times} of your notes, most plainly when you wrote “${quote}”`,
    );
  } else {
    sentences.push(`You have written ${said.length} sentences so far, and no idea has repeated yet`);
  }

  sentences.push(
    `Most of what you keep sits under ${theme}, ${themeCount} of ${said.length}`,
  );

  const second = ranked[1];
  if (second && second[1] > 1 && second[0] !== term) {
    const word = surface.get(second[0]) ?? second[0];
    sentences.push(`The other thread is ${word}, in ${second[1]} more`);
  }

  const bare = list.length - said.length;
  if (bare > 0) {
    sentences.push(
      `${bare} ${bare === 1 ? "book is" : "books are"} still waiting on a sentence`,
    );
  }

  return `${sentences.join(". ")}.`;
}


/* ---------------------------------------------------------------------------
 * Bookcloth. Six weaves, so a shelf reads as books from different binderies
 * rather than one boxed set. Each is a stack of repeating gradients laid over
 * the jacket colour, deliberately faint — cloth you notice only up close.
 * ------------------------------------------------------------------------ */
const CLOTHS = [
  // fine linen — the default weave, tight both ways
  `repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 3px),
   repeating-linear-gradient(0deg, rgba(0,0,0,.05) 0 1px, transparent 1px 3px)`,
  // coarse buckram — a wider, heavier grid
  `repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 5px),
   repeating-linear-gradient(0deg, rgba(0,0,0,.08) 0 1px, transparent 1px 5px)`,
  // ribbed — vertical cords only
  `repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0 1px, rgba(0,0,0,.04) 1px 2px, transparent 2px 4px)`,
  // laid — horizontal chain lines, like laid paper
  `repeating-linear-gradient(0deg, rgba(0,0,0,.07) 0 1px, transparent 1px 6px),
   repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 2px)`,
  // pebbled — a fine stipple
  `radial-gradient(rgba(0,0,0,.07) .6px, transparent .8px),
   radial-gradient(rgba(255,255,255,.06) .6px, transparent .8px)`,
  // twill — a diagonal weave
  `repeating-linear-gradient(45deg, rgba(255,255,255,.055) 0 1px, transparent 1px 4px),
   repeating-linear-gradient(-45deg, rgba(0,0,0,.05) 0 1px, transparent 1px 4px)`,
];

const CLOTH_SIZES = ["auto", "auto", "auto", "auto", "4px 4px, 4px 4px", "auto"];

function clothFor(key) {
  let seed = 0;
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  const i = seed % CLOTHS.length;
  return { image: CLOTHS[i], size: CLOTH_SIZES[i], index: i };
}

/** Pebbled needs its own offset so the two stipples do not sit on top of each other. */
function dressCloth(el, key) {
  const cloth = clothFor(key);
  el.style.backgroundImage = cloth.image;
  if (cloth.size !== "auto") {
    el.style.backgroundSize = cloth.size;
    el.style.backgroundPosition = "0 0, 2px 2px";
  }
}
