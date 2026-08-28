"use client";

import { useEffect, useRef } from "react";
import { drainInbox } from "@/lib/store";
import type { SaveInput } from "@/lib/library";

/**
 * Drains what the extension queued.
 *
 * The extension cannot hand over through chrome.storage — that API exists only
 * in extension contexts, and this is an ordinary page. So it writes into this
 * origin's localStorage instead, either by injecting into an open tab or by
 * opening the app with the save in query params. Both are drained here.
 */
export default function ExtensionInbox({
  onSave,
}: {
  onSave: (input: SaveInput) => void;
}) {
  const save = useRef(onSave);

  // assigning a ref during render is not allowed; do it in an effect
  useEffect(() => {
    save.current = onSave;
  }, [onSave]);

  useEffect(() => {
    function drain() {
      for (const item of drainInbox()) save.current(item);
    }

    // query params, consumed and stripped from the URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("save") === "1" && params.get("passage") !== null) {
      save.current({
        passage: params.get("passage") ?? "",
        thought: params.get("thought") ?? "",
        rawThought: params.get("rawThought") ?? "",
        title: params.get("title") ?? "",
        source: params.get("source") ?? "",
        link: params.get("link") ?? "",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }

    drain();

    // a tab left open should pick up a save without being reloaded
    window.addEventListener("library-inbox", drain);
    window.addEventListener("focus", drain);
    document.addEventListener("visibilitychange", drain);
    return () => {
      window.removeEventListener("library-inbox", drain);
      window.removeEventListener("focus", drain);
      document.removeEventListener("visibilitychange", drain);
    };
  }, []);

  return null;
}
