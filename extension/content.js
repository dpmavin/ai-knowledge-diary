// Runs in the page on demand. Returns the selection plus the article text.
// Nothing is stored here — the popup takes what it needs and this goes away.

(() => {
  const STRIP = "nav,header,footer,aside,script,style,noscript,form,iframe,button,figure figcaption";
  const NOISE = /(^|[-_ ])(nav|menu|header|footer|sidebar|comment|advert|ad|promo|related|share|social|newsletter|subscribe|cookie|banner|paywall)([-_ ]|$)/i;

  function looksLikeNoise(el) {
    const label = `${el.className || ""} ${el.id || ""}`;
    return typeof label === "string" && NOISE.test(label);
  }

  /** Largest coherent text block: score candidates by the text they hold. */
  function extractArticle() {
    const explicit = document.querySelector("article, main, [role='main']");
    const candidates = explicit
      ? [explicit]
      : Array.from(document.querySelectorAll("article, main, section, div"));

    let best = null;
    let bestScore = 0;

    for (const el of candidates) {
      if (looksLikeNoise(el)) continue;
      const paragraphs = el.querySelectorAll("p");
      if (paragraphs.length < 3) continue;

      let score = 0;
      for (const p of paragraphs) {
        if (looksLikeNoise(p)) continue;
        score += (p.innerText || "").trim().length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }

    const root = best || document.body;
    const clone = root.cloneNode(true);
    clone.querySelectorAll(STRIP).forEach((n) => n.remove());
    clone.querySelectorAll("*").forEach((n) => {
      if (looksLikeNoise(n)) n.remove();
    });

    return (clone.innerText || "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim()
      .slice(0, 20000);
  }

  return {
    passage: (window.getSelection()?.toString() || "").trim(),
    articleText: extractArticle(),
    title: document.title || "",
    url: location.href,
    domain: location.hostname.replace(/^www\./, ""),
  };
})();
