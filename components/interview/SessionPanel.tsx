"use client";

import { useI18n } from "@/components/shared/I18nProvider";
import { ActionBar } from "@/components/shared/ActionBar";
import { Button } from "@/components/shared/Button";
import { Panel } from "@/components/shared/Panel";
import { InterviewSession } from "@/lib/types";

interface SessionPanelProps {
  session: InterviewSession;
  onReset: () => void;
  onFinish: () => void;
}

export function SessionPanel({
  session,
  onReset,
  onFinish,
}: SessionPanelProps) {
  const { dictionary } = useI18n();
  const currentSection = session.sections.find(
    (section) => section.id === session.currentSectionId,
  );
  const currentIndex = session.sections.findIndex(
    (section) => section.id === session.currentSectionId,
  );
  const nextSection = session.sections[currentIndex + 1];

  return (
    <Panel className="print-hidden xl:sticky xl:top-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          {dictionary.interview.progress}
        </p>
        <p className="text-sm font-semibold text-muted">
          {currentSection?.title ?? session.sections[0]?.title}
        </p>
      </div>

      <p className="mt-4 font-serif text-5xl leading-none text-foreground">
        {Math.max(session.completionPercent, 4)}%
      </p>

      <div className="mt-4 h-2 rounded-full bg-surface-strong">
        <div
          className="h-2 rounded-full bg-accent"
          style={{ width: `${Math.max(session.completionPercent, 4)}%` }}
        />
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {dictionary.interview.currentFocus}
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {currentSection?.title ?? session.sections[0]?.title}
          </p>
        </div>

        {nextSection ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {dictionary.interview.next}
            </p>
            <p className="mt-2 text-base text-muted">{nextSection.title}</p>
          </div>
        ) : null}

        <div className="rounded-2xl bg-surface-strong px-4 py-3">
          <p className="text-sm leading-6 text-muted">
            {currentSection?.completionHint}
          </p>
        </div>
      </div>

      <ActionBar className="mt-6 flex-col">
        <Button fullWidth onClick={onFinish} disabled={session.answeredPromptCount === 0}>
          {dictionary.interview.finish}
        </Button>
        <Button fullWidth variant="ghost" onClick={onReset}>
          {dictionary.interview.reset}
        </Button>
      </ActionBar>
    </Panel>
  );
}
