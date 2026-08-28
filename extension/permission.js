// A popup cannot show Chrome's microphone prompt — it closes as soon as focus
// leaves it. This page runs in a tab, where the prompt can appear. Permission
// is granted to the extension's origin, so the popup inherits it afterwards.

const askEl = document.getElementById("ask");
const resultEl = document.getElementById("result");

askEl.addEventListener("click", async () => {
  askEl.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // We only needed the grant; release the device immediately.
    stream.getTracks().forEach((track) => track.stop());
    resultEl.textContent = "Done — close this tab and use the extension";
  } catch {
    resultEl.textContent = "Chrome blocked it. Allow the mic in site settings.";
    askEl.disabled = false;
  }
});
