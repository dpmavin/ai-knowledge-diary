// One volume. Data from data.js, palette and contrast from shared.js.

const shelf = library();
const index = Math.min(
  Math.max(Number(new URLSearchParams(location.search).get("i") ?? 0), 0),
  shelf.length - 1,
);
const book = shelf[index];
const colour = PALETTE[index % PALETTE.length];

/** Jackets on this page carry no type, so only the fill and grain are needed. */
function dressJacket(el, hex) {
  el.style.backgroundColor = hex;
  el.style.backgroundImage = GRAIN;
  el.style.backgroundSize = "120px 120px";
  el.style.boxShadow = inkOrWhite(hex).dark
    ? "inset 0 0 0 1px rgba(10,10,10,.09)"
    : "inset 0 0 0 1px rgba(255,255,255,.12)";
}

// dates are derived, so the page never contradicts itself
const saved = new Date(2026, 7, 27 - index * 3);
const stamp = saved
  .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  .toUpperCase();

document.title = `${book.full} · My knowledge diary`;
dressJacket(document.getElementById("entry-book"), colour);
// where it came from and when — one metadata line above the title
document.getElementById("entry-date").textContent = `${book.source} · ${stamp}`;
/*
 * The dot rides the last word rather than sitting loose after it. Left as its
 * own inline item it wraps onto a line of its own whenever the title fills the
 * measure, and reads as a stray mark floating under the heading.
 */
const titleText = escapeHtml(book.full);
const lastSpace = titleText.lastIndexOf(" ");
document.getElementById("entry-title").innerHTML =
  `${lastSpace === -1 ? "" : titleText.slice(0, lastSpace + 1)}` +
  `<span class="entry-tail">${
    lastSpace === -1 ? titleText : titleText.slice(lastSpace + 1)
  }<span class="entry-dot"></span></span>`;

/* ---------------------------------------------------------------------------
 * Tags — this volume's own labels, added by hand. Only the tags it carries are
 * shown: the full genre list is the shelf's business, not the volume's. Tap a
 * tag to edit it, the cross to remove it, the plus to add another.
 * ------------------------------------------------------------------------ */
const tagsEl = document.getElementById("tags");

// the shelf it was filed on is the label it starts with
let tags = Array.isArray(book.tags) ? book.tags.slice() : [book.theme];

function commitTags() {
  // deduped case-insensitively — "Blogs" and "blogs" are one label
  const seen = new Set();
  const kept = [];
  for (const raw of tags) {
    const name = raw.trim();
    if (name === "" || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    kept.push(name);
  }
  tags = kept;
  saveEdit(index, { tags });
  renderTags();
}

/** One field, used for both adding and editing, so they behave identically. */
function editTag(position, current) {
  const field = document.createElement("input");
  field.className = "tag-field";
  field.value = current;
  field.placeholder = "Name it";
  field.size = Math.max(current.length, 8);

  let done = false;
  const close = (keep) => {
    if (done) return;
    done = true;
    if (keep) tags[position] = field.value;
    else if (current === "") tags.splice(position, 1);
    commitTags();
  };

  field.addEventListener("keydown", (event) => {
    if (event.key === "Enter") close(true);
    if (event.key === "Escape") close(false);
  });
  field.addEventListener("blur", () => close(true));
  return field;
}

function renderTags() {
  tagsEl.textContent = "";

  const label = document.createElement("span");
  label.className = "tag-label";
  label.textContent = tags.length === 1 ? "Tag" : "Tags";
  tagsEl.append(label);

  tags.forEach((name, position) => {
    const chip = document.createElement("span");
    chip.className = "tag";

    const text = document.createElement("button");
    text.type = "button";
    text.className = "tag-text";
    text.textContent = name;
    text.addEventListener("click", () => {
      chip.replaceWith(editTag(position, name));
      tagsEl.querySelector(".tag-field").focus();
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "tag-x";
    remove.setAttribute("aria-label", `Remove ${name}`);
    remove.textContent = "\u00d7";
    remove.addEventListener("click", () => {
      tags.splice(position, 1);
      commitTags();
    });

    chip.append(text, remove);
    tagsEl.append(chip);
  });

  const add = document.createElement("button");
  add.type = "button";
  add.className = "tag-add";
  add.setAttribute("aria-label", "Add a tag");
  add.innerHTML = `<span class="tag-plus" aria-hidden="true"><i></i><i></i></span>Add tag`;
  add.addEventListener("click", () => {
    tags.push("");
    add.replaceWith(editTag(tags.length - 1, ""));
    tagsEl.querySelector(".tag-field").focus();
  });
  tagsEl.append(add);
}

renderTags();
/* What this is — the link described, whether it is an essay or a tool. */
const summaryNode = document.getElementById("entry-summary");
if (book.summary) summaryNode.textContent = book.summary;
// a fresh save has no summary yet, and a label with nothing under it is worse
else document.getElementById("summary-section").remove();
document.getElementById("meta-rail").textContent =
  `${book.source} · ${stamp} · ${book.thought ? "thought saved" : "nothing said"}`;
// a saved book keeps its own link; the seeded ones stand in
document.getElementById("original").href =
  book.link || "https://www.tooooools.app/animate/slide";

const pointsEl = document.getElementById("points");
const points = Array.isArray(book.points) ? book.points : [];
if (points.length === 0) pointsEl.closest(".entry-section").remove();
points.forEach((point) => {
  const li = document.createElement("li");
  li.textContent = point;
  pointsEl.append(li);
});

/* ---------------------------------------------------------------------------
 * My thoughts. One card per fragment — a volume read twice is a record of the
 * thinking, in the order it happened, so the cards stack oldest first. Inside
 * each, the thought is the largest text and the passage sits under it.
 * ------------------------------------------------------------------------ */
const tookEl = document.getElementById("took");
const tookCountEl = document.getElementById("took-count");

let fragments = book.fragments;

function saveFragments() {
  saveEdit(index, { fragments });
  // the rail and the status line both read whether anything has been said
  document.getElementById("meta-rail").textContent =
    `${book.source} · ${stamp} · ${said() ? "thought saved" : "nothing said"}`;
  renderTook();
}

function said() {
  return fragments.some((f) => (f.thought ?? "").trim() !== "");
}

/** Each fragment carries its own date once saved; the seed falls back. */
function stampFor(fragment) {
  if (!fragment.date) return stamp;
  return new Date(fragment.date)
    .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    .toUpperCase();
}

/** Editing keeps the sentence in the type it will be read in. */
function editFragment(card, position) {
  const fragment = fragments[position];
  card.textContent = "";

  const field = document.createElement("textarea");
  field.className = "took-edit";
  field.rows = 3;
  field.value = fragment.thought ?? "";

  const actions = document.createElement("div");
  actions.className = "took-actions";
  actions.innerHTML = `
    <button class="speak" type="button">
      <span class="speak-dot"></span><span class="speak-label">Speak it</span>
    </button>
    <span class="took-actions-right">
      <button class="took-cancel" type="button">Cancel</button>
      <button class="shelve" type="button">Save the sentence</button>
    </span>
  `;
  card.append(field, actions);

  if (fragment.passage) {
    const quote = document.createElement("p");
    quote.className = "took-passage";
    quote.textContent = `“${fragment.passage}”`;
    card.append(quote);
  }

  field.focus();
  field.setSelectionRange(field.value.length, field.value.length);

  const speakEl = actions.querySelector(".speak");
  const dictation = createDictation({
    field,
    button: speakEl,
    label: speakEl.querySelector(".speak-label"),
  });

  actions.querySelector(".took-cancel").addEventListener("click", () => {
    dictation.stop();
    renderTook();
  });

  actions.querySelector(".shelve").addEventListener("click", () => {
    dictation.stop();
    fragments[position] = { ...fragment, thought: field.value.trim() };
    saveFragments();
  });
}

function fragmentCard(fragment, position) {
  const card = document.createElement("article");
  card.className = "took-card";

  const thought = (fragment.thought ?? "").trim();
  if (thought) {
    const line = document.createElement("p");
    line.className = "took-thought";
    line.textContent = thought;
    card.append(line);
  }

  if (fragment.passage) {
    const quote = document.createElement("p");
    quote.className = "took-passage";
    quote.textContent = `“${fragment.passage}”`;
    card.append(quote);
  }

  if (!thought) {
    const none = document.createElement("p");
    none.className = "took-none";
    none.textContent = fragment.passage
      ? "Kept without a sentence. Say one now."
      : "Saved without a sentence. Say one now.";
    card.append(none);
  }

  const foot = document.createElement("div");
  foot.className = "took-foot";

  const when = document.createElement("span");
  when.className = "took-when";
  when.textContent = stampFor(fragment);

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "edit-note";
  edit.textContent = thought ? "Edit" : "Say one now";
  edit.addEventListener("click", () => editFragment(card, position));

  foot.append(when, edit);
  card.append(foot);
  return card;
}

function renderTook() {
  tookEl.textContent = "";
  tookCountEl.textContent =
    fragments.length > 1 ? `${fragments.length} saves` : "";
  fragments.forEach((fragment, position) =>
    tookEl.append(fragmentCard(fragment, position)));
}

renderTook();

/* ---------------------------------------------------------------------------
 * Taking it off the shelf. The volume is flagged rather than spliced out: its
 * index is what book.html opens with and what its edits and recommendations
 * are filed under, so renumbering the shelf would hand them to its neighbour.
 * Removing asks once, because there is no undo.
 * ------------------------------------------------------------------------ */
const removeSlot = document.getElementById("remove-slot");

function renderRemove() {
  removeSlot.textContent = "";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "remove";
  button.textContent = "Remove from shelf";
  button.addEventListener("click", askToRemove);
  removeSlot.append(button);
}

function askToRemove() {
  removeSlot.textContent = "";

  const asking = document.createElement("p");
  asking.className = "remove-ask";
  asking.textContent = "Remove this volume?";

  const yes = document.createElement("button");
  yes.type = "button";
  yes.className = "remove remove-yes";
  yes.textContent = "Remove";
  yes.addEventListener("click", () => {
    saveEdit(index, { removed: true });
    location.href = "home.html";
  });

  const no = document.createElement("button");
  no.type = "button";
  no.className = "remove";
  no.textContent = "Keep it";
  no.addEventListener("click", renderRemove);

  removeSlot.append(asking, yes, no);
}

renderRemove();

/* ---------------------------------------------------------------------------
 * Related — NOT other books on this shelf. These are things off the open web
 * that follow the thought, found by Claude with web search. The thought is the
 * search, not the article's topic: "I want the underlying research" fetches the
 * paper, "I like how this is written" fetches work on craft.
 *
 * Cached per volume, so opening a volume twice never spends a second call.
 * ------------------------------------------------------------------------ */
const railEl = document.getElementById("rail");
const RELATED_KEY = "journal-related";

function loadRelated() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(RELATED_KEY) ?? "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function cacheRelated(list) {
  const all = loadRelated();
  all[index] = list;
  try {
    window.localStorage.setItem(RELATED_KEY, JSON.stringify(all));
  } catch {
    // private mode — this session still has the results in memory
  }
}

async function askClaude(prompt, useWebSearch = false) {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt, useWebSearch }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Claude could not be reached.");
  return { text: String(data.text ?? ""), sources: data.sources ?? [] };
}

/** Models wrap JSON in prose or a fence. Take the first array in the text. */
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

/** Compare links ignoring protocol, www, trailing slash, and tracking params. */
function normaliseUrl(raw) {
  try {
    const url = new URL(raw);
    return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`
      .toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

async function findMore() {
  const intent = (book.thought ?? "").trim();
  const passage = book.passage ?? "";

  const prompt = `SEARCH INTENT — this is what to search for, and the only thing that matters:

"${intent || passage || book.full}"

${
    intent
      ? "That sentence is the reader's own note, written in their own words while reading. It is the primary signal. Find what they were reaching for when they wrote it. Follow the direction of the note, not the subject of the article: if the note is about how a thing is written, search for work on craft; if it asks for underlying evidence, search for the research; if it is about a mechanism, search for that mechanism elsewhere."
      : "The reader saved this without writing a note, so the passage itself is the intent. Results will be weaker than if they had written one."
  }

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

  const { text, sources } = await askClaude(prompt, true);
  const allowed = new Set(sources.map(normaliseUrl));

  return parseJson(text)
    .filter((r) => r && typeof r === "object")
    .map((r) => ({
      title: String(r.title ?? "").trim(),
      link: String(r.url ?? r.link ?? "").trim(),
      source: String(r.source ?? "").trim(),
      why: String(r.why ?? "").trim(),
    }))
    .filter((r) => r.title !== "" && r.link.startsWith("http"))
    // a link web search never returned was invented; drop it rather than show it
    .filter((r) => allowed.size === 0 || allowed.has(normaliseUrl(r.link)))
    .slice(0, 4);
}

/*
 * A hand-drawn flower, five petals struck at uneven angles so it reads as
 * something someone pressed into the page rather than an icon set.
 */
const FLOWER = `<svg class="rail-flower" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 12C9.7 9.5 9.9 5.4 12 3.5c2.2 2 2.4 6.1 0 8.5Z"/>
  <path d="M12 12C9.7 9.5 9.9 5.4 12 3.5c2.2 2 2.4 6.1 0 8.5Z" transform="rotate(71 12 12)"/>
  <path d="M12 12C9.7 9.5 9.9 5.4 12 3.5c2.2 2 2.4 6.1 0 8.5Z" transform="rotate(146 12 12)"/>
  <path d="M12 12C9.7 9.5 9.9 5.4 12 3.5c2.2 2 2.4 6.1 0 8.5Z" transform="rotate(217 12 12)"/>
  <path d="M12 12C9.7 9.5 9.9 5.4 12 3.5c2.2 2 2.4 6.1 0 8.5Z" transform="rotate(290 12 12)"/>
  <circle cx="12" cy="12" r="1.7"/>
</svg>`;

/** Four blank entries — the shape of the answer while it is being found. */
function renderRailWaiting() {
  railEl.innerHTML = `
    <p class="rail-state">Reading the web for what follows your thought…</p>
    ${'<div class="rail-item is-waiting"><span class="rail-bar"></span><span class="rail-bar"></span><span class="rail-bar is-short"></span></div>'.repeat(4)}
  `;
}

function renderRailError(message) {
  railEl.innerHTML = `<p class="rail-state">${escapeHtml(message)}</p>`;
  const again = document.createElement("button");
  again.type = "button";
  again.className = "rail-retry";
  again.textContent = "Try again";
  again.addEventListener("click", () => fillRail(true));
  railEl.append(again);
}

function renderRail(results) {
  railEl.textContent = "";

  if (results.length === 0) {
    renderRailError(
      book.thought
        ? "Nothing came back that follows this thought."
        : "Say what this meant to you and this fills with things that follow it.",
    );
    return;
  }

  results.forEach((result) => {
    const item = document.createElement("a");
    item.className = "rail-item";
    item.href = result.link;
    item.target = "_blank";
    item.rel = "noreferrer";
    item.innerHTML = `
      <p class="rail-source">${FLOWER}${escapeHtml(result.source || new URL(result.link).hostname)}</p>
      <p class="rail-title">${escapeHtml(result.title)}</p>
      <p class="rail-why">${escapeHtml(result.why)}</p>
    `;
    railEl.append(item);
  });
}

async function fillRail(refresh = false) {
  const cached = loadRelated()[index] ?? RELATED[index];
  if (!refresh && Array.isArray(cached)) return renderRail(cached);

  renderRailWaiting();
  try {
    const results = await findMore();
    cacheRelated(results);
    renderRail(results);
  } catch (error) {
    renderRailError(error.message);
  }
}

// refetching is deliberate, never automatic — the rail is cached for the demo
document.getElementById("rail-refresh").addEventListener("click", () => fillRail(true));
fillRail();
