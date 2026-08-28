// The shelf. Data lives in data.js; palette and contrast in shared.js.

function openBook(book) {
  window.location.href = `book.html?i=${book.at}`;
}

// 26 books, one looping shelf, and the capture sheet.




/*
 * A real shelf is not a row of upright bars. A few books lean and the ones
 * beside them take the weight, so these come in groups — a leaner and its
 * prop — rather than scattered singly. Keyed by position along the row and
 * fixed, so the shelf never rearranges itself between renders.
 */
const LEANS = {
  1: -6,  2: -2,          // the second book has slid down onto the first
  6: 3,   7: 7,   8: 2,   // a trio tipping right
  11: -4, 12: -7,         // a pair fallen the other way
  16: 5,  17: 2,
};

const shelfEl = document.getElementById("shelf");
const rowEl = document.getElementById("row");
const noteEl = document.getElementById("note");
const themesEl = document.getElementById("themes");
const totalEl = document.getElementById("total");
const fromEl = document.getElementById("from");

/*
 * `all` holds every volume at its true index — the number book.html opens with,
 * and the key every edit and every seeded recommendation is filed under. A
 * removed book therefore stays in the list and is only filtered out of view:
 * splicing it would renumber everything after it and quietly reassign edits.
 */
let all = [];
let books = [];

function shelf() {
  all = library().map((b, i) => ({
    ...b,
    colour: PALETTE[i % PALETTE.length],
    at: i,
  }));
  books = all.filter((b) => !b.removed);
}

shelf();

// Every number in the hero is derived, so they cannot contradict each other.
let theme = "All";
let query = "";
let focused = null; // the spine turned toward you

const summaryEl = document.querySelector(".summary-body");

/** Every number and every clause here is read off the shelf. */
function refreshHero() {
  totalEl.textContent = `Total volumes ${books.length}`;
  const said = books.filter((b) => b.thought && b.thought.trim() !== "").length;
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long" });
  fromEl.textContent = `From ${said} of your own thoughts · updated ${today}`;
  summaryEl.textContent = interestSummary(books);
}

// --- building a spine ----------------------------------------------------

function buildSpine(book, index) {
  const type = inkOrWhite(book.colour);
  const onDark = !type.dark; // white type means a dark jacket

  const spine = document.createElement("button");
  spine.type = "button";
  spine.className = "spine";
  spine.setAttribute("aria-label", `${book.full}, ${book.source}`);
  Object.assign(spine.dataset, {
    // the click handler and the note card both look the book up by this
    index: String(book.at),
    title: book.full,
    source: book.source,
    theme: book.theme,
    thought: book.thought,
    colour: book.colour,
    unread: String(book.unread),
  });

  spine.style.width = `${book.width}px`;
  spine.style.height = `${book.height}px`;
  spine.style.backgroundColor = book.colour;
  spine.style.backgroundImage = GRAIN;
  spine.style.backgroundSize = "120px 120px";
  spine.style.boxShadow = onDark
    ? "inset 0 0 0 1px rgba(255,216,255,.1)"
    : "inset 0 0 0 1px rgba(10,10,10,.09)";
  spine.style.setProperty("--band", onDark ? "rgba(0,0,0,.3)" : "rgba(10,10,10,.14)");
  spine.style.setProperty("--band-line", onDark ? "rgba(255,216,255,.16)" : "rgba(255,216,255,.5)");
  spine.style.setProperty("--foil", onDark ? "rgba(255,216,255,.26)" : "rgba(10,10,10,.16)");
  spine.style.setProperty("--title", type.title);

  const lean = LEANS[index];
  if (lean !== undefined) {
    spine.dataset.lean = String(lean);
    /*
     * A leaning book pivots on the bottom corner it is still standing on —
     * the far one lifts off the shelf. Rotating about the centre instead
     * sinks the base through the shelf line.
     */
    spine.style.transformOrigin = lean < 0 ? "bottom right" : "bottom left";
    spine.style.transform = `rotate(${lean}deg)`;
  }

  spine.innerHTML = `
    <span class="spine-weave"></span>
    <span class="spine-round"></span>
    <span class="spine-tail"></span>
    <span class="foil foil-top"></span>
    <span class="foil foil-bottom"></span>
    <span class="fore-edge"></span>
    <span class="colophon"></span>
    <span class="spine-title-wrap"><span class="spine-title">${escapeHtml(book.short)}</span></span>
  `;

  // each book wears its own cloth
  dressCloth(spine.querySelector(".spine-weave"), book.full);
  return spine;
}

/** Three copies: the loop jumps by one set's width, so an end is never reached. */
function matches(book) {
  if (theme !== "All" && book.theme !== theme) return false;
  if (query === "") return true;
  const hay =
    `${book.full} ${book.short} ${book.source} ${book.theme} ${book.thought}`.toLowerCase();
  return hay.includes(query);
}

/** One set. No duplicates, no loop — if it overflows, it simply scrolls. */
function renderShelf() {
  rowEl.textContent = "";
  books.filter(matches).forEach((book, i) => rowEl.append(buildSpine(book, i)));
  shelfEl.scrollLeft = 0;
}

// --- the note card -------------------------------------------------------

let hideTimer = null;

function showNote(spine) {
  clearTimeout(hideTimer);
  noteEl.classList.remove("is-interactive");
  noteEl.dataset.book = spine.dataset.index;
  const thought = spine.dataset.thought;
  const unread = spine.dataset.unread === "true";
  const status = thought
    ? "Read · thought saved"
    : unread ? "Unread" : "No thought yet";

  noteEl.innerHTML = `
    <div class="note-inner">
      <p class="note-source">${escapeHtml(spine.dataset.source)} article</p>
      <p class="note-title">${escapeHtml(spine.dataset.title)}</p>
      <p class="note-said"><span></span>${thought ? "You said" : "Nothing said yet"}</p>
      <p class="note-thought">${
        thought ? `“${escapeHtml(thought)}”` : "Saved without a sentence. Say one now."
      }</p>
    </div>
    <div class="note-foot">
      <span class="note-open">Open ›</span>
      <span class="note-status">${status}</span>
    </div>
  `;
  noteEl.hidden = false;

  const rect = spine.getBoundingClientRect();
  const half = noteEl.offsetWidth / 2; // the real box, not the spec number
  noteEl.style.left = `${Math.min(
    Math.max(rect.left + rect.width / 2, half + 20),
    window.innerWidth - half - 20,
  )}px`;

  /*
   * Sit above the whole shelf, not above this one book. Anchoring to a short
   * spine drops the card over its taller neighbours, and the card then eats
   * the pointer that was trying to scroll them.
   */
  // the 22px rise plus a 12px gap, measured from the frame floor
  let bottom = window.innerHeight - shelfEl.getBoundingClientRect().top + 56;

  /*
   * Clearing the books is the hard constraint, so this only ever moves the
   * card up, never down. Pushing it down to protect the pills was what put it
   * on top of the shelf.
   */
  /*
   * Clearing the books is the hard constraint. The old clamp pushed the card
   * DOWN to protect the theme list, which is exactly what put it on top of
   * the shelf — so this only ever moves it up.
   */
  const top = window.innerHeight - bottom - noteEl.offsetHeight;
  if (top < 12) bottom = window.innerHeight - 12 - noteEl.offsetHeight;

  noteEl.style.bottom = `${bottom}px`;
}

/**
 * The card is pointer-events: none so it can never block the shelf's scroll.
 * The cost is that the pointer falls through it onto whatever spine is behind,
 * which would swap the card to that book. So while the pointer is inside the
 * card's own rectangle, the shelf's hover events are ignored entirely.
 */
function pointerOverCard(event) {
  if (noteEl.hidden) return false;
  const r = noteEl.getBoundingClientRect();
  return (
    event.clientX >= r.left &&
    event.clientX <= r.right &&
    event.clientY >= r.top &&
    event.clientY <= r.bottom
  );
}

function hideNoteSoon() {
  hideTimer = setTimeout(() => { noteEl.hidden = true; }, 160);
}

rowEl.addEventListener("mouseover", (event) => {
  if (dragging || settling || focused) return; // never fight the focused book
  if (pointerOverCard(event)) return; // stay on the book the card belongs to
  const spine = event.target.closest(".spine");
  if (!spine) return;
  spine.style.transform = "translateY(-22px)"; // they straighten as they rise
  showNote(spine);
});

rowEl.addEventListener("mouseout", (event) => {
  if (focused) return;
  if (pointerOverCard(event)) return; // moving under the card is not leaving
  const spine = event.target.closest(".spine");
  if (!spine || spine.contains(event.relatedTarget)) return;
  spine.style.transform = spine.dataset.lean
    ? `rotate(${spine.dataset.lean}deg)`
    : "";
  hideNoteSoon();
});

rowEl.addEventListener("mousemove", (event) => {
  if (pointerOverCard(event)) clearTimeout(hideTimer);
});

noteEl.addEventListener(
  "wheel",
  (event) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
    shelfEl.scrollLeft += delta;
    noteEl.hidden = true;
  },
  { passive: true },
);

noteEl.addEventListener("click", () => {
  if (noteEl.dataset.book) openBook(all[Number(noteEl.dataset.book)]);
});
noteEl.addEventListener("mouseenter", () => clearTimeout(hideTimer));
noteEl.addEventListener("mouseleave", hideNoteSoon);

// --- the book ------------------------------------------------------------

const catcherEl = document.getElementById("catcher");
const bookEl = document.getElementById("book");
const coverEl = document.getElementById("cover");

/** Four cover forms, chosen by the title, so a book always wears its own. */
const ART = [
  { mask: "radial-gradient(circle at 50% 46%, transparent 0 27%, #000 41%, #000 63%, transparent 76%)", grid: "7px 7px" },
  { mask: "radial-gradient(circle at 50% 46%, #000 0 44%, transparent 57%)", grid: "8px 8px" },
  { mask: "linear-gradient(#000,#000) center/64% 58% no-repeat", grid: "6px 6px" },
  { mask: "linear-gradient(0deg, #000 0 62%, transparent 88%)", grid: "6px 9px" },
];

function artFor(title) {
  let seed = 0;
  for (let i = 0; i < title.length; i++) seed = (seed * 31 + title.charCodeAt(i)) >>> 0;
  return ART[seed % ART.length];
}

function buildCover(book) {
  const type = inkOrWhite(book.colour);
  const contrast = type.title;
  const art = artFor(book.full);

  coverEl.style.backgroundColor = book.colour;
  coverEl.style.backgroundImage = GRAIN;
  coverEl.style.backgroundSize = "120px 120px";
  coverEl.style.backgroundBlendMode = "overlay";
  coverEl.style.color = contrast;
  coverEl.style.boxShadow =
    "inset 0 0 0 1px rgba(255,255,255,.1), inset -16px 0 30px rgba(0,0,0,.16)";

  const status = book.thought ? "Read · thought saved" : "No thought yet";

  coverEl.innerHTML = `
    <span class="cover-weave"></span>
    <span class="cover-spine"><span style="color:${contrast}">${escapeHtml(book.full)}</span></span>
    <div class="cover-titles">
      <p class="cover-source" style="color:${contrast}">${escapeHtml(book.source)}</p>
      <p class="cover-title" style="color:${contrast}">${escapeHtml(book.full)}</p>
    </div>
    <span class="cover-art">
      <span class="art-base"></span><span class="art-depth"></span>
    </span>
    <div class="cover-foot" style="color:${contrast}">
      <span class="cover-rule"></span>
      <p class="cover-words">In my own words</p>
      <p class="cover-status">${status}</p>
      <span class="cover-colophon"></span>
    </div>
    <span class="cover-block"></span>
  `;

  dressCloth(coverEl.querySelector(".cover-weave"), book.full);

  /*
   * The dot field is the jacket a few shades down, never ink: at full contrast
   * it read as a second block of type and the title fell into it.
   */
  const artInk = shade(book.colour, 0.22);

  const base = coverEl.querySelector(".art-base");
  base.style.backgroundImage = `radial-gradient(${artInk} 1.1px, transparent 1.3px)`;
  base.style.backgroundSize = art.grid;
  base.style.webkitMaskImage = art.mask;
  base.style.maskImage = art.mask;

  const depth = coverEl.querySelector(".art-depth");
  const disc = "radial-gradient(circle at 50% 46%, #000 0 38%, transparent 68%)";
  depth.style.backgroundImage = `radial-gradient(${artInk} 1.1px, transparent 1.3px)`;
  depth.style.backgroundSize = "11px 11px";
  depth.style.opacity = "0.5";
  depth.style.webkitMaskImage = disc;
  depth.style.maskImage = disc;
}

function openCover(spine) {
  const book = all[Number(spine.dataset.index)];
  if (!book) return console.warn("no book for spine", spine.dataset.index);
  noteEl.hidden = true;
  focused = spine;

  buildCover(book);
  bookEl.hidden = catcherEl.hidden = false;

  // only the collection recedes
  rowEl.style.opacity = "0.2";
}

function closeBook() {
  if (!focused) return;
  focused = null;
  lieFlat();
  bookEl.hidden = catcherEl.hidden = true;
  rowEl.style.opacity = ""; // clear it, do not set it back to 1
}

/* Click the spine to see the cover, click the cover to open the volume. */
/*
 * Tilt: lean toward the cursor, and only while the pointer is over the book
 * itself — the frame is exactly the cover's size, so its own bounds are the
 * radius. DESIGN.md caps a related-items card at 7 degrees; a cover held open
 * at the centre of the page is a bigger object and carries twice that.
 */
const TILT = 14;
const stillPlease = window.matchMedia("(prefers-reduced-motion: reduce)");

function leanToward(event) {
  if (stillPlease.matches) return;
  const r = coverEl.getBoundingClientRect();
  const x = (event.clientX - r.left) / r.width - 0.5; // -0.5 at the left edge
  const y = (event.clientY - r.top) / r.height - 0.5;
  coverEl.style.setProperty("--tilt-y", `${(x * 2 * TILT).toFixed(2)}deg`);
  coverEl.style.setProperty("--tilt-x", `${(-y * 2 * TILT).toFixed(2)}deg`);
}

function lieFlat() {
  coverEl.style.setProperty("--tilt-x", "0deg");
  coverEl.style.setProperty("--tilt-y", "0deg");
}

bookEl.addEventListener("mousemove", leanToward);
bookEl.addEventListener("mouseleave", lieFlat);

coverEl.addEventListener("click", (event) => {
  event.stopPropagation();
  openBook(all[Number(focused.dataset.index)]);
});

catcherEl.addEventListener("click", closeBook);

// anything in the frame that is not the cover itself is outside the book
bookEl.addEventListener("click", (event) => {
  if (!event.target.closest(".cover")) closeBook();
});



/** Escape puts the book back on the shelf. */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && focused) closeBook();
});

// --- dragging, momentum, and the loop ------------------------------------

let dragging = false;
let pressTarget = null;
let settling = false;
let startX = 0;
let startScroll = 0;
let lastX = 0;
let lastTime = 0;
let velocity = 0;

shelfEl.addEventListener("pointerdown", (event) => {
  pressTarget = event.target.closest(".spine");
  dragging = true;
  settling = false;
  velocity = 0;
  startX = lastX = event.clientX;
  startScroll = shelfEl.scrollLeft;
  lastTime = performance.now();
  shelfEl.classList.add("is-dragging");
  shelfEl.setPointerCapture(event.pointerId);
});

shelfEl.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  shelfEl.scrollLeft = startScroll - (event.clientX - startX);
  const now = performance.now();
  const dt = now - lastTime;
  if (dt > 0) velocity = (event.clientX - lastX) / dt;
  lastX = event.clientX;
  lastTime = now;
  noteEl.hidden = true;
});

shelfEl.addEventListener("pointerup", (event) => {
  if (!dragging) return;
  dragging = false;
  shelfEl.classList.remove("is-dragging");
  shelfEl.releasePointerCapture(event.pointerId);

  // a press that barely moved is a click, not a drag
  if (pressTarget && Math.abs(event.clientX - startX) < 5) {
    clearTimeout(hideTimer);
    openCover(pressTarget);
    pressTarget = null;
    return;
  }
  pressTarget = null;

  // momentum, easing to a stop
  settling = true;
  let v = velocity * 16;
  (function glide() {
    if (Math.abs(v) < 0.4) { settling = false; return; }
    shelfEl.scrollLeft -= v;
    v *= 0.94;
    requestAnimationFrame(glide);
  })();
});

// shift-scroll and trackpad
shelfEl.addEventListener("wheel", (event) => {
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY;
  shelfEl.scrollLeft += delta;
  noteEl.hidden = true;
}, { passive: true });

// --- lying flat ----------------------------------------------------------

// --- face-out cards ------------------------------------------------------

const gridViewEl = document.getElementById("grid-view");
const gridEl = document.getElementById("grid");
const gridCountEl = document.getElementById("grid-count");

function buildFace(book) {
  const fill = rgb(book.colour);
  const type = inkOrWhite(book.colour);
  const base = type.dark ? [10, 10, 10] : [255, 255, 255];
  const ink = (alpha) =>
    `rgba(${base[0]},${base[1]},${base[2]},${alpha.toFixed(2)})`;

  // small type needs more of the ink than a 22px title does
  const metaInk = ink(solveAlpha(base, fill));
  const titleInk = ink(type.dark ? 0.86 : 0.95);

  const card = document.createElement("button");
  card.type = "button";
  card.className = "face";
  card.style.backgroundColor = book.colour;
  card.style.backgroundImage = GRAIN;
  card.style.backgroundSize = "120px 120px";
  card.style.boxShadow = "inset 0 0 0 1px rgba(255,255,255,.12)";

  const status = book.thought
    ? "Read"
    : book.unread ? "Unread" : "No thought yet";

  card.addEventListener("click", () => openBook(book));
  card.innerHTML = `
    <span class="face-weave"></span>
    <span class="face-edge"></span>
    <div class="face-top">
      <p class="face-source" style="color:${metaInk}">${escapeHtml(book.source)}</p>
      <p class="face-title" style="color:${titleInk}">${escapeHtml(book.full)}</p>
    </div>
    <div class="face-bottom">
      <p class="face-quote" style="color:${metaInk}">${
        book.thought ? `“${escapeHtml(book.thought)}”` : "Nothing said yet."
      }</p>
      <p class="face-status" style="color:${metaInk}">${status}</p>
    </div>
  `;
  dressCloth(card.querySelector(".face-weave"), book.full);
  return card;
}

function renderGrid() {
  const visible = books.filter(matches);
  const parts = [];
  if (query !== "") parts.push(`“${query}”`);
  if (theme !== "All") parts.push(theme);
  parts.push(`${visible.length} ${visible.length === 1 ? "volume" : "volumes"}`);

  gridEl.textContent = "";
  gridCountEl.textContent = parts.join(" · ");

  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "grid-empty";
    empty.textContent = "Nothing filed here yet.";
    gridEl.append(empty);
    return;
  }
  visible.forEach((book) => gridEl.append(buildFace(book)));
}

/** Unfiltered keeps the shelf; any filter turns the books to face you. */
function setView() {
  noteEl.hidden = true;
  refreshHero();

  const filtered = theme !== "All" || query !== "";
  document.body.classList.toggle("is-shelf", !filtered);
  shelfEl.hidden = filtered;
  gridViewEl.hidden = !filtered;

  if (filtered) {
    // the grid scrolls with the page, so nothing is cut off at a frame edge
    renderGrid();
    window.scrollTo({ top: 0 });
  } else {
    renderShelf();
  }

  themesEl.querySelectorAll(".theme").forEach((el) =>
    el.setAttribute("aria-pressed", String(el.dataset.theme === theme)));
}

// --- themes -------------------------------------------------------------

THEMES.forEach((name) => {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "theme";
  el.dataset.theme = name;
  el.textContent = name;
  el.addEventListener("click", () => { theme = name; closeBook(); setView(); });
  themesEl.append(el);
});

// --- search --------------------------------------------------------------

const searchToggleEl = document.getElementById("open-search");
const searchEl = document.getElementById("search");

searchToggleEl.addEventListener("click", () => {
  const opening = searchEl.hidden;
  searchEl.hidden = !opening;
  searchToggleEl.setAttribute("aria-pressed", String(opening));
  if (opening) return searchEl.focus();
  searchEl.value = "";
  query = "";
  closeBook();
  setView();
});

searchEl.addEventListener("input", () => {
  query = searchEl.value.trim().toLowerCase();
  closeBook();
  setView();
});

searchEl.addEventListener("keydown", (event) => {
  if (event.key === "Escape") searchToggleEl.click();
});

// --- capture -------------------------------------------------------------

const sheetEl = document.getElementById("sheet");
const scrimEl = document.getElementById("scrim");
const linkEl = document.getElementById("link");
const previewEl = document.getElementById("preview");
const chipEl = document.getElementById("preview-chip");
const previewSourceEl = document.getElementById("preview-source");
const previewTitleEl = document.getElementById("preview-title");
const sentenceEl = document.getElementById("sentence");

function sourceFor(url) {
  let host = "";
  try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
  if (/\.pdf$/i.test(url) || host.includes("arxiv")) return "Paper";
  for (const name of ["substack", "linkedin", "medium", "reddit"]) {
    if (host.includes(name)) return name[0].toUpperCase() + name.slice(1);
  }
  if (host === "x.com" || host.includes("twitter")) return "X";
  return host;
}

function titleFor(url) {
  try {
    const slug = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
    return slug
      .replace(/\.[a-z]+$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  } catch { return ""; }
}

function openSheet() { sheetEl.hidden = scrimEl.hidden = false; linkEl.focus(); }
function closeSheet() {
  dictation?.stop();
  sheetEl.hidden = scrimEl.hidden = true;
  linkEl.value = sentenceEl.value = previewTitleEl.value = "";
  previewEl.hidden = true;
}

document.getElementById("open-sheet").addEventListener("click", openSheet);
document.getElementById("sheet-close").addEventListener("click", closeSheet);
scrimEl.addEventListener("click", closeSheet);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

linkEl.addEventListener("input", () => {
  const found = sourceFor(linkEl.value.trim());
  if (!found) { previewEl.hidden = true; return; }
  previewEl.hidden = false;
  chipEl.style.background = PALETTE[books.length % PALETTE.length];
  previewSourceEl.textContent = `${found} · found`;
  previewTitleEl.value = titleFor(linkEl.value.trim()) || "Untitled";
});

const speakEl = document.getElementById("speak");
const dictation = createDictation({
  field: sentenceEl,
  button: speakEl,
  label: speakEl.querySelector(".speak-label"),
});

/** Classified from what it says, so it lands in a real theme, not a bucket. */
function themeFor(text) {
  const t = text.toLowerCase();
  if (/\.pdf|arxiv|\b(paper|journal|study)\b/.test(t)) return "Readings";
  if (/substack|medium|\bx\.com|twitter|\b(blog|newsletter)\b/.test(t)) return "Blogs";
  if (/\b(design|type|layout|craft|studio|portfolio|film|photography|colour|color)\b/.test(t))
    return "Inspiration";
  return "Miscellaneous";
}

document.getElementById("shelve").addEventListener("click", () => {
  const link = linkEl.value.trim();
  const title = previewTitleEl.value.trim() || "Untitled";
  const thought = sentenceEl.value.trim();

  // the same path the extension takes, so a hand save survives a reload too
  addBook({
    title,
    thought,
    // `source` at module scope is the active filter; do not shadow it
    source: sourceFor(link) || "Saved by hand",
    tag: themeFor(`${title} ${thought} ${link}`),
    link,
  });
  shelf();

  closeSheet();
  theme = "All";
  closeBook();
  setView(); // the hero counts refresh from the data
});

setView();

/*
 * A save can land after this page has rendered — the extension writes into
 * this origin and shouts, rather than reloading the tab under you.
 */
window.addEventListener("library-inbox", () => {
  shelf();
  setView();
});
