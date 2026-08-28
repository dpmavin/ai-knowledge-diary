/* ---------------------------------------------------------------------------
 * Knowledge LLM — ask questions of the archive itself.
 *
 * Loaded last on both pages, so it reads what they already built (library() on
 * the shelf, `book` and `shelf` on a volume) and touches nothing. Everything it
 * adds to the DOM is created here.
 *
 * The two pages share one panel and differ only in what gets sent. The shelf
 * sends the whole library; a volume sends itself and its shelf-mates. Scope is
 * the point: on a volume page the answer must be about that piece.
 * ------------------------------------------------------------------------ */
(() => {
  const ON_VOLUME = document.body.classList.contains("book-page");

  const SUGGESTIONS = ON_VOLUME
    ? [
        "What's the core argument?",
        "What's the key takeaway?",
        "How does this connect to what I've saved before?",
      ]
    : [
        "What have I saved about UI design?",
        "How many pieces are in my library?",
        "What have I been reading about lately?",
      ];

  const SPARK =
    '<svg class="ask-spark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 1.6c.9 5.2 3.3 7.6 8.5 8.5-5.2.9-7.6 3.3-8.5 8.5-.9-5.2-3.3-7.6-8.5-8.5 5.2-.9 7.6-3.3 8.5-8.5Z"/>' +
    "</svg>";

  /* --- the material -------------------------------------------------------
   * Dates are derived the same way the volume page derives them, so a date
   * quoted in an answer matches the one printed on the page.
   */

  function stampFor(index) {
    return new Date(2026, 7, 27 - index * 3)
      .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function fragmentsFor(volume) {
    return (volume.fragments ?? []).map((f) => ({
      passage: f.passage ?? "",
      myThought: f.thought ?? "",
      date: f.date ? new Date(f.date).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      }) : "",
    }));
  }

  function volumeFor(volume, index) {
    return {
      title: volume.full,
      author: volume.author ?? "",
      source: volume.source,
      link: volume.link ?? "",
      dateSaved: stampFor(index),
      shelf: volume.theme,
      summary: volume.summary ?? "",
      keyPoints: Array.isArray(volume.points) ? volume.points : [],
      myFragments: fragmentsFor(volume),
    };
  }

  /** The whole collection, plus the counts, already counted. */
  function libraryMaterial() {
    const all = library().filter((b) => !b.removed);
    const volumes = all.map((b, i) => volumeFor(b, i));

    const perShelf = {};
    for (const v of volumes) perShelf[v.shelf] = (perShelf[v.shelf] ?? 0) + 1;

    return {
      counts: {
        volumes: volumes.length,
        fragments: volumes.reduce((n, v) => n + v.myFragments.length, 0),
        fragmentsCarryingMyThought: volumes.reduce(
          (n, v) => n + v.myFragments.filter((f) => f.myThought.trim() !== "").length, 0),
        volumesPerShelf: perShelf,
      },
      volumes,
    };
  }

  /** One volume, plus what they have said on the rest of that shelf. */
  function volumeMaterial() {
    const others = shelf
      .map((b, i) => ({ b, i }))
      .filter(({ b, i }) => i !== index && !b.removed && b.theme === book.theme)
      .map(({ b, i }) => ({
        title: b.full,
        source: b.source,
        dateSaved: stampFor(i),
        myThoughts: (b.fragments ?? [])
          .map((f) => f.thought)
          .filter((t) => t && t.trim() !== ""),
      }))
      .filter((v) => v.myThoughts.length > 0);

    return { thisVolume: volumeFor(book, index), myThoughtsOnThisShelf: others };
  }

  const material = () => (ON_VOLUME ? volumeMaterial() : libraryMaterial());

  /* --- the panel --------------------------------------------------------- */

  const panel = document.createElement("aside");
  panel.className = "ask";
  panel.id = "ask";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Knowledge LLM");
  panel.innerHTML = `
    <header class="ask-head">
      <span class="ask-name">Knowledge LLM</span>
      <button class="ask-info" id="ask-info" type="button"
              aria-label="What this answers from" aria-expanded="false">i</button>
      <div class="ask-tools">
        <button class="ask-tool" id="ask-reset" type="button" aria-label="Start over" title="Start over">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/>
          </svg>
        </button>
        <button class="ask-tool" id="ask-close" type="button" aria-label="Close" title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18"/>
          </svg>
        </button>
      </div>
    </header>

    <p class="ask-note" id="ask-note" hidden>
      Answers come only from ${ON_VOLUME ? "this volume and your notes on the same shelf" : "what you have saved and written"}. If your archive
      doesn't cover something, it says so rather than answering from elsewhere.
    </p>

    <div class="ask-body" id="ask-body">
      <div class="ask-empty" id="ask-empty">
        <h2>What would you like to know?</h2>
        <ul class="ask-suggestions" id="ask-suggestions"></ul>
      </div>
      <div class="ask-thread" id="ask-thread"></div>
    </div>

    <form class="ask-foot" id="ask-form">
      <div class="ask-quote" id="ask-quote" hidden>
        <p id="ask-quote-text"></p>
        <button class="ask-drop" id="ask-drop" type="button" aria-label="Remove this quote">&times;</button>
      </div>
      <div class="ask-field">
        <textarea class="ask-input" id="ask-input" rows="1"
                  placeholder="${ON_VOLUME ? "Ask about this piece" : "Ask your library"}"></textarea>
        <button class="ask-send" id="ask-send" type="submit" aria-label="Send" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
          </svg>
        </button>
      </div>
    </form>
  `;
  document.body.append(panel);

  const bodyEl = panel.querySelector("#ask-body");
  const emptyEl = panel.querySelector("#ask-empty");
  const threadEl = panel.querySelector("#ask-thread");
  const formEl = panel.querySelector("#ask-form");
  const inputEl = panel.querySelector("#ask-input");
  const sendEl = panel.querySelector("#ask-send");
  const quoteEl = panel.querySelector("#ask-quote");
  const quoteTextEl = panel.querySelector("#ask-quote-text");

  SUGGESTIONS.forEach((text) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ask-suggestion";
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↳";
    button.append(arrow, document.createTextNode(text));
    button.addEventListener("click", () => ask(text));
    li.append(button);
    panel.querySelector("#ask-suggestions").append(li);
  });

  /* --- conversation ------------------------------------------------------ */

  let turns = []; // cleared on close, as a session should be
  let quote = "";
  let busy = false;

  function setQuote(text) {
    quote = text;
    quoteTextEl.textContent = text ? `“${text}”` : "";
    quoteEl.hidden = text === "";
  }

  function refreshSend() {
    sendEl.disabled = busy || inputEl.value.trim() === "";
  }

  function scrollDown() {
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function addMine(text) {
    emptyEl.hidden = true;
    const turn = document.createElement("div");
    turn.className = "ask-turn";
    const mine = document.createElement("p");
    mine.className = "ask-mine";
    mine.textContent = text;
    const said = document.createElement("div");
    said.className = "ask-said";
    said.innerHTML = '<span class="ask-dots"><i></i><i></i><i></i></span>';
    turn.append(mine, said);
    threadEl.append(turn);
    scrollDown();
    return said;
  }

  async function ask(question) {
    if (busy) return;
    const asked = question.trim();
    if (asked === "") return;

    // the quote rides along with the question, then lets go
    const sent = quote ? `About this passage:\n“${quote}”\n\n${asked}` : asked;
    setQuote("");
    inputEl.value = "";
    inputEl.style.height = "auto";

    busy = true;
    refreshSend();
    const said = addMine(asked);
    turns.push({ role: "user", content: sent });

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scope: ON_VOLUME ? "volume" : "library",
          material: material(),
          messages: turns,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error((await response.text()) || "Could not reach Knowledge LLM.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      said.textContent = "";

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        said.textContent = answer;
        scrollDown();
      }

      /*
       * A failure mid-stream arrives behind a marker, because the response has
       * already committed to being a 200 by the time the model gives up.
       */
      const at = answer.indexOf("\u0000");
      const text = at === -1 ? answer : answer.slice(0, at);
      const failure = at === -1 ? "" : answer.slice(at + 1);

      said.textContent = text.trim() === "" ? "" : text;

      if (failure) {
        const line = document.createElement("p");
        line.className = "ask-said is-error";
        line.style.marginTop = text.trim() === "" ? "0" : "10px";
        line.textContent = failure;
        said.append(line);
        // a half-answer is not worth carrying into the next turn
        turns.pop();
      } else if (text.trim() === "") {
        said.textContent = "No answer came back.";
      } else {
        turns.push({ role: "assistant", content: text });
      }
    } catch (error) {
      // the page underneath is untouched; only this turn failed
      said.classList.add("is-error");
      said.textContent = error.message;
      turns.pop();
    } finally {
      busy = false;
      refreshSend();
      scrollDown();
    }
  }

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(inputEl.value);
  });

  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = `${Math.min(inputEl.scrollHeight, 120)}px`;
    refreshSend();
  });

  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      ask(inputEl.value);
    }
  });

  panel.querySelector("#ask-drop").addEventListener("click", () => setQuote(""));

  function reset() {
    turns = [];
    threadEl.textContent = "";
    emptyEl.hidden = false;
    setQuote("");
    inputEl.value = "";
    inputEl.style.height = "auto";
    refreshSend();
  }

  panel.querySelector("#ask-reset").addEventListener("click", reset);

  const noteEl = panel.querySelector("#ask-note");
  const infoEl = panel.querySelector("#ask-info");
  infoEl.addEventListener("click", () => {
    noteEl.hidden = !noteEl.hidden;
    infoEl.setAttribute("aria-expanded", String(!noteEl.hidden));
  });

  /* --- opening and closing ----------------------------------------------- */

  function open(withQuote = "") {
    // the shelf's own overlays would sit under the panel; put them away first
    const note = document.getElementById("note");
    if (note) note.hidden = true;
    const catcher = document.getElementById("catcher");
    if (catcher && !catcher.hidden) catcher.click();

    setQuote(withQuote);
    panel.hidden = false;
    document.body.classList.add("ask-open");
    inputEl.focus();
  }

  function close() {
    panel.hidden = true;
    document.body.classList.remove("ask-open");
    reset();
  }

  panel.querySelector("#ask-close").addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) close();
  });

  /* --- the standing way in ----------------------------------------------- */

  const entry = document.createElement("button");
  entry.type = "button";
  entry.className = "ask-entry";
  entry.innerHTML = `${SPARK}Knowledge LLM`;
  entry.addEventListener("click", () => open(""));
  document.body.append(entry);

  /* --- the selection pill ------------------------------------------------ */

  let pill = null;

  function dropPill() {
    pill?.remove();
    pill = null;
    document.body.classList.remove("ask-picking");
  }

  function selectedText() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    // never offer to ask about the panel's own text
    if (panel.contains(range.commonAncestorContainer)) return null;

    const text = selection.toString().trim();
    if (text.length < 2) return null;

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;
    return { text, rect };
  }

  const GAP = 8; // how far the pill sits off the selection

  /**
   * Anchored to the selection itself, never to the panel: centred on the
   * range's box and sitting just above it, or just below when the selection
   * starts too near the top of the window for the pill to fit above it.
   */
  function place(rect) {
    // measured, not assumed — the pill is in the document by now
    const box = pill.getBoundingClientRect();
    const half = box.width / 2;

    pill.style.left = `${Math.min(
      Math.max(rect.left + rect.width / 2, half + 8),
      window.innerWidth - half - 8,
    )}px`;

    const below = rect.top - GAP - box.height < 0;
    pill.classList.toggle("is-below", below);
    pill.style.top = `${below ? rect.bottom + GAP : rect.top - GAP}px`;
  }

  function offer() {
    const found = selectedText();
    if (!found) return dropPill();

    dropPill();
    pill = document.createElement("button");
    pill.type = "button";
    pill.className = "ask-pill";
    pill.innerHTML = `${SPARK}Ask Knowledge LLM`;

    pill.addEventListener("mousedown", (event) => event.preventDefault());
    pill.addEventListener("click", () => {
      const text = found.text;
      dropPill();
      window.getSelection()?.removeAllRanges();
      open(text);
    });

    document.body.append(pill);
    place(found.rect);
    document.body.classList.add("ask-picking");
  }

  document.addEventListener("mouseup", (event) => {
    if (pill && pill.contains(event.target)) return;
    // let the selection settle before measuring it
    setTimeout(offer, 0);
  });

  document.addEventListener("mousedown", (event) => {
    if (pill && !pill.contains(event.target)) dropPill();
  });

  document.addEventListener("scroll", dropPill, true);
  window.addEventListener("resize", dropPill);
})();
