// Demo only. Same markup and stylesheet as the real popup; the chrome.* calls
// are replaced by the page itself, so the flow can be shown without loading
// the extension. Speech is real — a normal page can ask for the microphone.

const PASSAGE_CAP = 1200;

const shell = document.getElementById("popup-shell");
const states = document.querySelectorAll(".state");
const passageEl = document.getElementById("passage");
const thoughtEl = document.getElementById("thought");
const sourceEl = document.getElementById("source");
const micEl = document.getElementById("mic");
const saveEl = document.getElementById("save");
const savePageEl = document.getElementById("save-page");
const savedLineEl = document.getElementById("saved-line");
const iconEl = document.getElementById("icon");
const receiptEl = document.getElementById("receipt");
const receiptBodyEl = document.getElementById("receipt-body");
const titleEl = document.getElementById("title");

let captured = { passage: "", title: "", url: "", domain: "" };
let spoken = false;

function show(name) {
  states.forEach((s) => {
    s.hidden = s.dataset.state !== name;
  });
}

// --- opening the popup ---------------------------------------------------

iconEl.addEventListener("click", () => {
  const selection = (window.getSelection()?.toString() || "").trim();

  captured = {
    passage: selection,
    title: "AI Got Good at Feelings. Now What?",
    url: "https://medium.com/@bydivya/ai-got-good-at-feelings-now-what",
    domain: "medium.com",
  };

  shell.hidden = false;
  sourceEl.textContent = captured.domain;
  titleEl.value = captured.title;

  if (!selection) return show("empty");

  passageEl.value =
    selection.length > PASSAGE_CAP
      ? `${selection.slice(0, PASSAGE_CAP)}…`
      : selection;
  show("ready");
  thoughtEl.focus();
});

// click away closes, nothing persists
document.addEventListener("mousedown", (event) => {
  if (shell.hidden) return;
  if (shell.contains(event.target) || iconEl.contains(event.target)) return;
  shell.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") shell.hidden = true;
});

// --- voice ---------------------------------------------------------------

const Recognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;
let engine = null;
let listening = false;

if (!Recognition) micEl.hidden = true;

function stopListening() {
  engine?.stop();
  listening = false;
  micEl.setAttribute("aria-pressed", "false");
  micEl.title = "Speak your thought";
}

micEl.addEventListener("click", () => {
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
  engine.onerror = () => stopListening();

  engine.start();
  listening = true;
  micEl.setAttribute("aria-pressed", "true");
  micEl.title = "Listening — tap to stop";
});

thoughtEl.addEventListener("input", () => {
  if (!listening) spoken = false;
});

// --- saving --------------------------------------------------------------

function commit(passage) {
  if (listening) stopListening();

  const thought = thoughtEl.value.trim();
  const item = {
    passage,
    thought,
    rawThought: spoken ? thought : "",
    title: titleEl.value.trim() || captured.title,
    source: captured.domain,
    link: captured.url,
    savedAt: new Date().toISOString(),
  };

  show("saving");

  setTimeout(() => {
    savedLineEl.textContent = thought
      ? "Saved to your library"
      : "Saved — no thought yet";
    show("saved");

    receiptEl.hidden = false;
    receiptBodyEl.textContent = JSON.stringify(item, null, 2);

    setTimeout(() => {
      shell.hidden = true;
      passageEl.value = "";
      thoughtEl.value = "";
      titleEl.value = "";
      spoken = false;
      receiptEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 1000);
  }, 700);
}

saveEl.addEventListener("click", () => commit(passageEl.value.trim()));
savePageEl.addEventListener("click", () => commit(""));
