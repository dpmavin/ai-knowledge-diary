// Nothing to coordinate yet — the popup injects content.js itself via
// chrome.scripting. Kept so the manifest's service worker resolves and there
// is somewhere obvious to move shared logic later.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Library capture installed");
});
