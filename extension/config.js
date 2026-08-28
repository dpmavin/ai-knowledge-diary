/*
 * The one place the library's address lives.
 *
 * Flip this before zipping the extension for anyone else — on their machine
 * nothing is running on localhost, and every save would go quietly nowhere:
 *
 *   const APP_ORIGIN = "https://your-library.vercel.app";
 *
 * Chrome reads permissions from manifest.json before any script runs, so it
 * cannot see this file. The same origin therefore appears twice more, under
 * "host_permissions" and under "content_scripts[0].matches". Change all three
 * together — popup.js compares them at startup and says so if they drift.
 */
const APP_ORIGIN = "http://localhost:3113";

/** Where the shelf sits under that origin. */
const SHELF_PATH = "/mockup/home.html";
