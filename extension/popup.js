// Capture only. The extension never displays the library.

// APP_ORIGIN and SHELF_PATH come from config.js — the one place to change them.
const SHELF_URL = `${APP_ORIGIN}${SHELF_PATH}`;
const INBOX_KEY = "librarySaves";

/**
 * config.js and manifest.json have to name the same origin, and nothing else
 * will tell you when they stop: an origin Chrome holds no permission for does
 * not throw, it just never receives the save.
 */
function originIsGranted() {
  const granted = chrome.runtime.getManifest().host_permissions ?? [];
  return granted.some((pattern) => pattern.startsWith(`${APP_ORIGIN}/`));
}

const originOk = originIsGranted();
if (!originOk) {
  console.error(
    `Library: config.js points at ${APP_ORIGIN}, which is not in manifest.json's ` +
      `host_permissions (${chrome.runtime.getManifest().host_permissions?.join(", ") || "none"}). ` +
      "Add it there and to content_scripts[0].matches, then reload the extension.",
  );
}
const PASSAGE_CAP = 1200;

const states = document.querySelectorAll(".state");
const passageEl = document.getElementById("passage");
const originEl = document.getElementById("origin");
const thoughtEl = document.getElementById("thought");
const micEl = document.getElementById("mic");
const micEnableEl = document.getElementById("mic-enable");
const saveEl = document.getElementById("save");
const savePageEl = document.getElementById("save-page");
const closeEl = document.getElementById("close");
const tagsEl = document.getElementById("tags");

const THEMES = ["Inspiration", "Readings", "Blogs", "Miscellaneous"];

// the four shelves plus anything typed in here — tags are freeform on the
// volume, so capture should not be the one place you cannot invent one
let themes = [...THEMES];
let tag = "Miscellaneous";

/*
 * What this save is OF. The highlight is the default and the whole point: a
 * volume is worth keeping for the part you pulled out of it, not for its full
 * text. "The whole article" keeps the title and link so you can go back to it,
 * and stores no passage — the article stays where it is published.
 */
const SCOPES = [
  { id: "passage", label: "Highlight selected portion" },
  { id: "article", label: "Save entire web link" },
];
let scope = "passage";

const scopeEl = document.getElementById("scope");
const passageLabelEl = document.getElementById("passage-label");
const wholeNoteEl = document.getElementById("whole-note");

function renderScope() {
  scopeEl.textContent = "";
  for (const option of SCOPES) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "tag";
    chip.textContent = option.label;
    chip.setAttribute("aria-pressed", String(scope === option.id));
    // nothing was highlighted, so there is no highlight to choose
    chip.disabled = option.id === "passage" && !captured.passage;
    chip.addEventListener("click", () => {
      scope = option.id;
      renderScope();
    });
    scopeEl.append(chip);
  }

  const whole = scope === "article";
  passageEl.hidden = whole;
  passageLabelEl.hidden = whole;
  wholeNoteEl.hidden = !whole;
}

/** Guessed from the page, then changeable — the guess is a default, not a verdict. */
function guessTag(text) {
  const t = text.toLowerCase();
  if (/\.pdf|arxiv|\b(paper|journal|study)\b/.test(t)) return "Readings";
  if (/substack|medium|x\.com|twitter|\b(blog|newsletter)\b/.test(t)) return "Blogs";
  if (/\b(design|type|layout|craft|studio|portfolio|film|photography|colour|color)\b/.test(t))
    return "Inspiration";
  return "Miscellaneous";
}

/** Typed in place, the way a tag is added on the volume page. */
function newTagField() {
  const field = document.createElement("input");
  field.className = "tag-field";
  field.placeholder = "Name it";
  field.size = 9;

  let done = false;
  const close = (keep) => {
    if (done) return;
    done = true;
    const name = field.value.trim();
    if (keep && name !== "") {
      const already = themes.find((t) => t.toLowerCase() === name.toLowerCase());
      if (!already) themes.push(name);
      tag = already ?? name;
    }
    renderTags();
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
  for (const name of themes) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "tag";
    chip.textContent = name;
    chip.setAttribute("aria-pressed", String(tag === name));
    chip.addEventListener("click", () => {
      tag = name;
      renderTags();
    });
    tagsEl.append(chip);
  }

  const add = document.createElement("button");
  add.type = "button";
  add.className = "tag tag-add";
  add.setAttribute("aria-label", "Add a tag");
  const plus = document.createElement("span");
  plus.className = "tag-plus";
  plus.append(document.createElement("i"), document.createElement("i"));
  add.append(plus, document.createTextNode("Add tag"));
  add.addEventListener("click", () => {
    const field = newTagField();
    add.replaceWith(field);
    field.focus();
  });
  tagsEl.append(add);
}
const savedLineEl = document.getElementById("saved-line");
const savedTitleEl = document.getElementById("saved-title");
const goShelfEl = document.getElementById("go-shelf");
// Full text is kept here and saved; only the display is capped.
let captured = { passage: "", articleText: "", title: "", url: "", domain: "" };
let spoken = false;

function show(name) {
  states.forEach((s) => {
    s.hidden = s.dataset.state !== name;
  });
}

// --- capture -------------------------------------------------------------

async function capture() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return show("empty");

  let result;
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    result = injection?.result;
  } catch {
    // Restricted page (chrome://, the Web Store). Fall back to tab metadata.
    result = null;
  }

  captured = result ?? {
    passage: "",
    articleText: "",
    title: tab.title || "",
    url: tab.url || "",
    domain: (() => {
      try {
        return new URL(tab.url || "").hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    })(),
  };

  // where this came from, said once and quietly — the title is editable on
  // the volume page, which is where you are actually looking at it
  originEl.textContent = "";
  const domain = document.createElement("b");
  domain.textContent = captured.domain;
  originEl.append(domain, captured.title ? ` · ${captured.title}` : "");
  originEl.title = `${captured.domain} · ${captured.title}`;

  tag = guessTag(`${captured.title} ${captured.url} ${captured.passage}`);
  renderTags();

  renderScope();

  if (!captured.passage) return show("empty");

  passageEl.value =
    captured.passage.length > PASSAGE_CAP
      ? `${captured.passage.slice(0, PASSAGE_CAP)}…`
      : captured.passage;
  show("ready");
  thoughtEl.focus();
}

// --- voice ---------------------------------------------------------------

const Recognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;
let engine = null;
let listening = false;

if (!Recognition) micEl.hidden = true;

/**
 * A popup cannot show Chrome's microphone prompt — it closes when focus leaves.
 * permission.html runs in a tab where the prompt can appear; the grant lands on
 * the extension's origin, so the popup inherits it from then on.
 */
function offerPermission() {
  micEl.hidden = true;
  micEnableEl.hidden = false;
}

micEnableEl?.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("permission.html") });
  window.close();
});

function stopListening() {
  engine?.stop();
  listening = false;
  micEl.setAttribute("aria-pressed", "false");
  micEl.title = "Speak your thought";
  thoughtEl.classList.remove("is-listening");
}

closeEl?.addEventListener("click", () => window.close());

micEl?.addEventListener("click", () => {
  if (listening) return stopListening();

  engine = new Recognition();
  engine.continuous = true;
  engine.interimResults = true;
  engine.lang = "en-US";

  engine.onresult = (event) => {
    // Rebuilt each time: a second recording replaces, never appends.
    let transcript = "";
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    thoughtEl.value = transcript.trim();
    spoken = true;
  };
  engine.onend = stopListening;
  engine.onerror = (event) => {
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      offerPermission();
    }
    stopListening();
  };

  try {
    engine.start();
  } catch {
    offerPermission();
    return;
  }
  listening = true;
  micEl.setAttribute("aria-pressed", "true");
  micEl.title = "Listening — tap to stop";
  thoughtEl.classList.add("is-listening");
});

thoughtEl?.addEventListener("input", () => {
  if (!listening) spoken = false; // typed over — no longer a transcript
});

// --- saving --------------------------------------------------------------

function buildSave(passage) {
  const thought = thoughtEl.value.trim();
  return {
    passage,
    thought,
    rawThought: spoken ? thought : "",
    title: captured.title,
    tag,
    source: captured.domain,
    link: captured.url,
    savedAt: new Date().toISOString(),
  };
}

/**
 * The app is an ordinary web page, so it cannot read chrome.storage — that API
 * exists only in extension contexts. The save has to reach the app's own origin.
 *
 * If a library tab is open, write straight into it. If not, the copy in
 * chrome.storage waits there and bridge.js hands it over the next time the
 * shelf is opened. Saving never navigates: you stay on the article.
 */
async function appendInPage(item) {
  const tabs = await chrome.tabs.query({ url: `${APP_ORIGIN}/*` });
  if (tabs.length === 0) return false;

  await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    args: [INBOX_KEY, item],
    func: (key, save) => {
      let queue = [];
      try {
        queue = JSON.parse(window.localStorage.getItem(key) ?? "[]");
        if (!Array.isArray(queue)) queue = [];
      } catch {
        queue = [];
      }
      queue.push(save);
      window.localStorage.setItem(key, JSON.stringify(queue));
      // wake an app tab that is already sitting open
      window.dispatchEvent(new Event("library-inbox"));
    },
  });
  return true;
}

async function persist(item) {
  // a durable copy, in case neither route below lands
  try {
    const existing = await chrome.storage.local.get(INBOX_KEY);
    const queue = Array.isArray(existing[INBOX_KEY]) ? existing[INBOX_KEY] : [];
    queue.push(item);
    await chrome.storage.local.set({ [INBOX_KEY]: queue });
  } catch {
    // storage unavailable; the routes below still work
  }

  try {
    if (await appendInPage(item)) return "live";
  } catch {
    // no library tab, or injection refused — bridge.js will deliver it
  }
  return "waiting";
}

async function commit(passage) {
  if (listening) stopListening();
  saveEl.disabled = true;
  show("saving");

  const item = buildSave(passage);
  await persist(item);

  // a misconfigured origin still keeps the save; it just cannot deliver it
  savedLineEl.textContent = !originOk
    ? "Saved — but the shelf address is wrong"
    : item.thought
      ? "It is on your shelf"
      : "On your shelf — no thought yet";
  savedTitleEl.textContent = item.title;
  show("saved");
}

/* The save has already happened, so both of these are only about where you go
 * next. Cancel keeps you on the article you were reading. */
goShelfEl?.addEventListener("click", async () => {
  const [open] = await chrome.tabs.query({ url: `${APP_ORIGIN}/*` });
  if (open) await chrome.tabs.update(open.id, { url: SHELF_URL, active: true });
  else await chrome.tabs.create({ url: SHELF_URL });
  window.close();
});


// The thought is optional, so Save is never blocked on it.
saveEl?.addEventListener("click", () =>
  commit(scope === "article" ? "" : passageEl.value.trim() || captured.passage));
savePageEl?.addEventListener("click", () => {
  scope = "article";
  commit("");
});

// Escape closes without saving. Nothing persists.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") window.close();
});

capture();
