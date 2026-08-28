"use client";

import { useState } from "react";
import Mic from "@/components/Mic";
import type { SaveInput } from "@/lib/library";

export default function AddSheet({
  onSave,
  onClose,
}: {
  onSave: (input: SaveInput) => void;
  onClose: () => void;
}) {
  const [passage, setPassage] = useState("");
  const [thought, setThought] = useState("");
  const [spoken, setSpoken] = useState(false);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [link, setLink] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  function submit() {
    onSave({
      passage,
      thought,
      // Only a spoken thought carries a raw transcript to repair.
      rawThought: spoken ? thought : "",
      title,
      source,
      link,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/20" />

      <div className="relative max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-t-[12px] border border-hairline bg-page px-5 pb-8 pt-6 md:rounded-[12px]">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] font-light">Add a save</h2>
          <button onClick={onClose} className="meta text-warm">
            Cancel
          </button>
        </div>

        <label className="meta mt-6 block" htmlFor="passage">
          Passage
        </label>
        <textarea
          id="passage"
          rows={4}
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          placeholder="Paste or type what you highlighted"
          className="mt-2 w-full resize-none rounded-[12px] bg-surface p-4 text-[15px] leading-relaxed text-ink placeholder:text-mute focus:outline-none"
        />

        <label className="meta mt-5 block" htmlFor="thought">
          Your thought
        </label>
        <textarea
          id="thought"
          rows={3}
          autoFocus
          value={thought}
          onChange={(e) => {
            setThought(e.target.value);
            setSpoken(false); // typed over — no longer a transcript
          }}
          placeholder="Interpretation, reaction, what you'd use it for…"
          className="mt-2 w-full resize-none rounded-[12px] bg-surface p-4 font-display text-[22px] font-light leading-[1.4] text-ink placeholder:font-sans placeholder:text-[15px] placeholder:leading-relaxed placeholder:text-mute focus:outline-none"
        />
        <Mic
          onTranscript={(text) => {
            setThought(text);
            setSpoken(true);
          }}
        />

        <button
          onClick={() => setShowOptional((open) => !open)}
          className="meta mt-6 block text-warm"
        >
          {showOptional ? "Hide details" : "Title, source, link"}
        </button>

        {showOptional && (
          <div className="mt-3 space-y-3">
            {[
              { value: title, set: setTitle, placeholder: "Title" },
              { value: source, set: setSource, placeholder: "Source" },
              { value: link, set: setLink, placeholder: "Link" },
            ].map((field) => (
              <input
                key={field.placeholder}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder}
                className="w-full rounded-[999px] bg-surface px-5 py-3 text-[15px] text-ink placeholder:text-mute focus:outline-none"
              />
            ))}
          </div>
        )}

        {/* The thought is optional, so Save is always enabled. */}
        <button
          onClick={submit}
          disabled={passage.trim() === ""}
          className="mt-7 w-full rounded-[999px] bg-ink py-3 text-[15px] font-medium text-white disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}
