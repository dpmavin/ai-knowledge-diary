"use client";

import { useState } from "react";
import Mic from "@/components/Mic";
import type { Fragment } from "@/lib/types";

/**
 * Set as prose, not as a card: a rule, the thought, then the passage as a
 * pull quote beneath it. The hierarchy is carried by size and colour rather
 * than by a container.
 */
export default function FragmentCard({
  fragment,
  onAddThought,
}: {
  fragment: Fragment;
  onAddThought: (fragmentId: string, thought: string) => void;
}) {
  const [showRaw, setShowRaw] = useState(false);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState("");
  const hasThought = fragment.thought.trim() !== "";

  return (
    <article className="border-t border-hairline pt-8">
      {hasThought ? (
        <>
          {/* MY THOUGHT is the largest text on screen. Never reverse this. */}
          <button
            onClick={() => fragment.rawThought && setShowRaw((open) => !open)}
            className="block w-full text-left font-display text-[22px] font-light leading-[1.4] md:text-[28px]"
          >
            {fragment.thought}
          </button>

          {fragment.rawThought && (
            <p className="meta mt-3 text-warm">
              {showRaw ? "Hide what I said" : "What I actually said"}
            </p>
          )}
          {showRaw && fragment.rawThought && (
            <p className="mt-3 rounded-[12px] bg-surface p-4 text-[15px] leading-relaxed text-mute">
              {fragment.rawThought}
            </p>
          )}

          <p className="mt-6 border-l border-hairline pl-5 text-[15px] italic leading-relaxed text-mute md:text-[19px]">
            {fragment.passage}
          </p>
        </>
      ) : (
        <>
          <p className="border-l border-hairline pl-5 text-[15px] italic leading-relaxed text-mute md:text-[19px]">
            {fragment.passage}
          </p>

          {writing ? (
            <div className="mt-5">
              <textarea
                rows={3}
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Why does this matter?"
                className="w-full resize-none rounded-[12px] bg-surface p-4 font-display text-[22px] font-light leading-[1.4] text-ink placeholder:font-sans placeholder:text-[15px] placeholder:leading-relaxed placeholder:text-mute focus:outline-none"
              />
              <Mic onTranscript={setDraft} />
              <button
                onClick={() => {
                  if (draft.trim() !== "") onAddThought(fragment.id, draft);
                  setWriting(false);
                }}
                className="ml-3 mt-3 rounded-[999px] bg-ink px-5 py-2 text-[15px] font-medium text-white"
              >
                Save thought
              </button>
            </div>
          ) : (
            <button
              onClick={() => setWriting(true)}
              className="mt-5 rounded-[999px] border border-hairline bg-page px-5 py-2 text-[15px] font-medium text-ink"
            >
              Add a thought
            </button>
          )}
        </>
      )}
    </article>
  );
}
