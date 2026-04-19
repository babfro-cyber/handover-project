"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ConversationPane } from "@/components/interview/ConversationPane";
import { InterviewComposer } from "@/components/interview/InterviewComposer";
import { InterviewStartForm } from "@/components/interview/InterviewStartForm";
import { SectionTracker } from "@/components/interview/SectionTracker";
import { SessionPanel } from "@/components/interview/SessionPanel";
import { InterviewHints } from "@/components/interview/InterviewHints";
import { AppShell } from "@/components/shared/AppShell";
import { useI18n } from "@/components/shared/I18nProvider";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { generateDocument } from "@/lib/documentGenerator";
import {
  advanceInterview,
  createNamedBlankSession,
  getActiveAssistantPrompt,
  getInterviewHints,
  relocalizeSession,
} from "@/lib/interviewEngine";
import {
  clearDocument,
  clearSession,
  loadActiveSessionId,
  loadSession,
  saveDocument,
  saveSession,
  setActiveSessionId,
} from "@/lib/storage";
import { InterviewSession } from "@/lib/types";

export function InterviewExperience() {
  const { dictionary, language } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const shouldStartNew = searchParams.get("new") === "1";
    const storedSession = shouldStartNew ? null : loadSession();

    if (shouldStartNew && loadActiveSessionId()) {
      setActiveSessionId(null);
    }

    // Local storage hydration intentionally happens after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(storedSession ?? null);
    setHydrated(true);
  }, [searchParams]);

  useEffect(() => {
    const resolvedSession =
      session && session.language !== language
        ? relocalizeSession(session, language)
        : session;

    if (!hydrated || !resolvedSession) {
      return;
    }

    saveSession(resolvedSession);
    if (resolvedSession.answeredPromptCount > 0) {
      saveDocument(generateDocument(resolvedSession, language));
    }
  }, [hydrated, language, session]);

  const resolvedSession = useMemo(
    () =>
      session && session.language !== language
        ? relocalizeSession(session, language)
        : session,
    [language, session],
  );

  function handleStartInterview(values: { firstName: string; lastName: string }) {
    const nextSession = createNamedBlankSession(language, values);
    setSession(nextSession);
    saveSession(nextSession);
    clearDocument(nextSession.id);
    router.replace("/interview");
  }

  function handleSubmit(value: string) {
    setSession((current) => {
      if (!current) {
        return current;
      }

      const nextSession = advanceInterview(
        current,
        value,
        language,
      );
      return nextSession;
    });
  }

  function handleReset() {
    if (!resolvedSession) {
      return;
    }

    const resetSession = createNamedBlankSession(language, {
      firstName: resolvedSession.firstName,
      lastName: resolvedSession.lastName,
    });
    const nextSession = { ...resetSession, id: resolvedSession.id };

    clearDocument(resolvedSession.id);
    setSession(nextSession);
  }

  function handleFinish() {
    if (!resolvedSession) {
      return;
    }

    saveSession(resolvedSession);
    saveDocument(generateDocument(resolvedSession, language));
    clearSession();
    router.push("/");
  }

  if (!resolvedSession) {
    return (
      <AppShell>
        <div className="mb-6 flex items-start justify-between gap-6 print-hidden">
          <div>
            <Link href="/" className="text-sm font-semibold text-muted hover:text-foreground">
              {dictionary.common.backToHome}
            </Link>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              {dictionary.interview.areaLabel}
            </p>
          </div>
          <LanguageToggle compact />
        </div>
        <InterviewStartForm onStart={handleStartInterview} />
      </AppShell>
    );
  }

  const activeQuestion = getActiveAssistantPrompt(resolvedSession.messages, language);
  const currentSection =
    resolvedSession.sections.find(
      (section) => section.id === resolvedSession.currentSectionId,
    ) ?? resolvedSession.sections[0];

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between gap-6 print-hidden">
        <div>
          <Link href="/" className="text-sm font-semibold text-muted hover:text-foreground">
            {dictionary.common.backToHome}
          </Link>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            {dictionary.interview.areaLabel}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {dictionary.interview.captureNote}
          </p>
        </div>
        <LanguageToggle compact />
      </div>

      <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1.9fr)_320px]">
        <div className="flex min-h-0 flex-col">
          <SectionTracker sections={resolvedSession.sections} />
          <ConversationPane
            messages={resolvedSession.messages}
            activeQuestion={activeQuestion}
            currentSectionTitle={currentSection.title}
          />
          <InterviewComposer onSubmit={handleSubmit} />
          <InterviewHints
            hints={getInterviewHints(resolvedSession.currentSectionId, language)}
          />
        </div>
        <SessionPanel
          session={resolvedSession}
          onReset={handleReset}
          onFinish={handleFinish}
        />
      </div>
    </AppShell>
  );
}
