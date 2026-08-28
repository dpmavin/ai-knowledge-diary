/*
 * Runs on the library's own origin. The popup can write chrome.storage but the
 * page cannot read it, so the queue is handed across here, once, on load.
 *
 * This is the path for a save made while no library tab was open: it waits in
 * extension storage until the shelf is next opened, then becomes a book.
 */
const INBOX_KEY = "librarySaves";

chrome.storage.local.get(INBOX_KEY).then((stored) => {
  const queue = Array.isArray(stored[INBOX_KEY]) ? stored[INBOX_KEY] : [];
  if (queue.length === 0) return;

  let waiting = [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(INBOX_KEY) ?? "[]");
    if (Array.isArray(raw)) waiting = raw;
  } catch {
    waiting = [];
  }

  window.localStorage.setItem(INBOX_KEY, JSON.stringify(waiting.concat(queue)));
  chrome.storage.local.remove(INBOX_KEY);

  // if the shelf already rendered, tell it rather than reloading under the user
  window.dispatchEvent(new Event("library-inbox"));
});
