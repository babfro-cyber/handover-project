"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";

import { Language } from "@/lib/i18n";

type SpeechStatus =
  | "idle"
  | "listening"
  | "stopped"
  | "unavailable"
  | "denied"
  | "error";

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function getRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function getRecognitionLocale(language: Language) {
  return language === "fr" ? "fr-FR" : "en-AU";
}

function normalizeTranscript(transcript: string) {
  return transcript.replace(/\s+/g, " ").trim();
}

interface UseSpeechRecognitionOptions {
  language: Language;
  onTranscriptChange: (transcript: string) => void;
}

export function useSpeechRecognition({
  language,
  onTranscriptChange,
}: UseSpeechRecognitionOptions) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const manualStopRef = useRef(false);
  const handleTranscriptChange = useEffectEvent(onTranscriptChange);
  const [status, setStatus] = useState<SpeechStatus>(() =>
    getRecognitionConstructor() ? "idle" : "unavailable",
  );

  useEffect(() => {
    const Recognition = getRecognitionConstructor();

    if (!Recognition) {
      recognitionRef.current = null;
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getRecognitionLocale(language);

    recognition.onstart = () => {
      setStatus("listening");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += `${event.results[index]?.[0]?.transcript ?? ""} `;
      }

      handleTranscriptChange(normalizeTranscript(transcript));
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setStatus("denied");
        return;
      }

      setStatus("error");
    };

    recognition.onend = () => {
      setStatus((current) => {
        if (current === "denied" || current === "unavailable" || current === "error") {
          return current;
        }

        return manualStopRef.current ? "stopped" : "idle";
      });
      manualStopRef.current = false;
    };

  recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setStatus("unavailable");
      return;
    }

    manualStopRef.current = false;

    try {
      recognitionRef.current.start();
    } catch {
      setStatus("error");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    manualStopRef.current = true;
    recognitionRef.current.stop();
  }, []);

  return {
    isSupported: status !== "unavailable",
    isListening: status === "listening",
    status,
    startListening,
    stopListening,
  };
}
