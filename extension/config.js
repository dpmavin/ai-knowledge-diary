/*
 * Where the library lives.
 *
 * Two origins, on purpose: the local server you develop and demo against, and
 * the deployed site anyone else would use. The popup saves into whichever one
 * is actually open, and falls back to the deployed one when neither is.
 *
 * Chrome reads permissions from manifest.json before any script runs, so it
 * cannot see this file — every origin here must also appear in manifest.json
 * under "host_permissions" and "content_scripts[0].matches". popup.js compares
 * the two at startup and says so if they drift.
 */
const APP_ORIGINS = [
  "http://localhost:3113",
  "https://ai-knowledge-diary.vercel.app",
];

/** Where the shelf sits under any of them. */
const SHELF_PATH = "/mockup/home.html";
