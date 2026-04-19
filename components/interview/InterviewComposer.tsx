"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import { useI18n } from "@/components/shared/I18nProvider";
import { Button } from "@/components/shared/Button";
import { Panel } from "@/components/shared/Panel";
import { TextareaField } from "@/components/shared/TextareaField";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { cn } from "@/lib/utils";

interface InterviewComposerProps {
  onSubmit: (value: string) => void;
}

export function InterviewComposer({ onSubmit }: InterviewComposerProps) {
  const { dictionary, language } = useI18n();
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<"type" | "speak">("type");
  const speechBaseRef = useRef("");
  const {
    isSupported,
    isListening,
    startListening,
    status,
    stopListening,
  } = useSpeechRecognition({
    language,
    onTranscriptChange: (transcript) => {
      const baseText = speechBaseRef.current.trim();

      if (!transcript) {
        setValue(baseText);
        return;
      }

      setValue(baseText ? `${baseText}\n${transcript}` : transcript);
    },
  });

  useEffect(() => {
    if (mode === "type" && isListening) {
      stopListening();
    }
  }, [isListening, mode, stopListening]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    if (isListening) {
      stopListening();
    }

    onSubmit(trimmed);
    setValue("");
    speechBaseRef.current = "";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const trimmed = value.trim();

      if (trimmed) {
        if (isListening) {
          stopListening();
        }

        onSubmit(trimmed);
        setValue("");
        speechBaseRef.current = "";
      }
    }
  }

  function handleMicrophoneToggle() {
    if (isListening) {
      stopListening();
      return;
    }

    speechBaseRef.current = value.trim();
    startListening();
  }

  const statusLabel =
    status === "listening"
      ? dictionary.interview.speechListening
      : status === "stopped"
        ? dictionary.interview.speechStopped
        : status === "denied"
          ? dictionary.interview.speechDenied
          : status === "unavailable"
            ? dictionary.interview.speechUnavailable
            : status === "error"
              ? dictionary.interview.speechError
              : dictionary.interview.speechHint;

  return (
    <Panel className="mt-4 px-6 py-5 lg:px-8 lg:py-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="interview-response"
            className="text-sm font-semibold uppercase tracking-[0.16em] text-muted"
          >
            {dictionary.interview.yourAnswer}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">{dictionary.interview.answerMode}</span>
            <div className="inline-flex rounded-full border border-border bg-white p-1">
              {([
                ["type", dictionary.interview.typeResponse],
                ["speak", dictionary.interview.speakResponse],
              ] as const).map(([nextMode, label]) => (
                <button
                  key={nextMode}
                  type="button"
                  onClick={() => setMode(nextMode)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                    mode === nextMode
                      ? "bg-accent text-white"
                      : "text-muted hover:bg-surface-strong",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {mode === "speak" ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border/80 bg-surface-strong px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMicrophoneToggle}
                disabled={!isSupported && status === "unavailable"}
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold",
                  isListening
                    ? "bg-accent text-white"
                    : "border border-border bg-white text-foreground hover:bg-surface",
                  !isSupported && status === "unavailable" && "cursor-not-allowed text-muted",
                )}
              >
                {isListening
                  ? dictionary.interview.stopMicrophone
                  : dictionary.interview.startMicrophone}
              </button>
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  isListening ? "bg-accent" : "bg-border",
                )}
              />
            </div>
            <p className="text-sm text-muted">{statusLabel}</p>
          </div>
        ) : null}

        <div>
          <TextareaField
            id="interview-response"
            className="min-h-[220px] text-[19px] leading-8"
            placeholder={
              mode === "speak"
                ? language === "fr"
                  ? "Parlez librement. Le texte apparaîtra ici, puis vous pourrez le corriger avant l’envoi."
                  : "Speak naturally. The transcript will appear here and you can edit it before sending."
                : dictionary.interview.answerPlaceholder
            }
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {dictionary.interview.submitHint}
          </p>
          <Button type="submit" disabled={!value.trim()} className="px-6">
            {dictionary.interview.sendAnswer}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
