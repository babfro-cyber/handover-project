"use client";

import { useI18n } from "@/components/shared/I18nProvider";

interface InterviewHintsProps {
  hints: string[];
}

export function InterviewHints({ hints }: InterviewHintsProps) {
  const { dictionary } = useI18n();

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {dictionary.interview.hintsTitle}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {hints.slice(0, 3).map((hint) => (
          <span
            key={hint}
            className="inline-flex rounded-full border border-border bg-white/75 px-3 py-1.5 text-sm text-muted"
          >
            {hint}
          </span>
        ))}
      </div>
    </div>
  );
}
