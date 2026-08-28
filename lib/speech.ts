"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type SpeechEvent = {
  resultIndex: number;
  results: { length: number; [i: number]: { 0: { transcript: string } } };
};

function getRecognitionCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Web Speech API. A second recording replaces the transcript rather than
 * appending (FLOWS.md). `supported` goes false when the browser lacks the API
 * or the user denies the mic — the caller hides the button and typing keeps
 * working either way.
 */
export function useSpeech(onTranscript: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const callback = useRef(onTranscript);
  callback.current = onTranscript;

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
  }, []);

  const stop = useCallback(() => {
    recognition.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const engine = new Ctor();
    engine.continuous = true;
    engine.interimResults = true;
    engine.lang = "en-US";

    let transcript = "";
    engine.onresult = (event) => {
      // Rebuild from scratch each time: re-recording replaces, never appends.
      transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      callback.current(transcript.trim());
    };
    engine.onend = () => setListening(false);
    engine.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setSupported(false); // permission denied — hide the button, keep typing
      }
      setListening(false);
    };

    recognition.current = engine;
    engine.start();
    setListening(true);
  }, []);

  useEffect(() => () => recognition.current?.stop(), []);

  return { supported, listening, start, stop };
}
