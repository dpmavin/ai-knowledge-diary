/*
 * The one thing a popup cannot do.
 *
 * Chrome shows its microphone prompt only where focus can rest, and a popup
 * closes the moment focus leaves it — the prompt would appear and die in the
 * same frame. A tab can hold it. The grant lands on the extension's origin, so
 * every popup afterwards inherits it and this page is never needed again.
 */
const askEl = document.getElementById("ask");
const resultEl = document.getElementById("result");

function say(text, good = false) {
  resultEl.textContent = text;
  resultEl.classList.toggle("is-good", good);
}

askEl.addEventListener("click", async () => {
  askEl.disabled = true;
  say("Waiting for Chrome…");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // the grant is what was wanted; give the microphone straight back
    stream.getTracks().forEach((track) => track.stop());

    say("Done — you can speak a thought now", true);
    askEl.textContent = "Closing…";

    // close the tab we were opened in, so the flow ends where it started
    setTimeout(async () => {
      try {
        const tab = await chrome.tabs.getCurrent();
        if (tab?.id) await chrome.tabs.remove(tab.id);
      } catch {
        say("Done — you can close this tab", true);
        askEl.textContent = "Allowed";
      }
    }, 1200);
  } catch (error) {
    const blocked = error?.name === "NotAllowedError";
    say(
      blocked
        ? "Chrome blocked it — allow the microphone in site settings"
        : "No microphone found",
    );
    askEl.disabled = false;
  }
});
