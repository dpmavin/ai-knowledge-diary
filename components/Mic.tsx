"use client";

import { useSpeech } from "@/lib/speech";

/**
 * Hidden entirely when the API is missing or permission was denied — typing
 * always works, so there is nothing to explain and nothing to fall back to.
 */
export default function Mic({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) {
  const { supported, listening, start, stop } = useSpeech(onTranscript);
  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-pressed={listening}
      className={
        listening
          ? "mt-3 rounded-[999px] bg-ink px-5 py-2 text-[15px] font-medium text-white"
          : "mt-3 rounded-[999px] border border-hairline bg-page px-5 py-2 text-[15px] font-medium text-ink"
      }
    >
      {listening ? "Listening — tap to stop" : "Speak your thought"}
    </button>
  );
}
