"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DocumentSummaryPanel } from "@/components/output/DocumentSummaryPanel";
import { DocumentTopBar } from "@/components/output/DocumentTopBar";
import { EditableSectionCard } from "@/components/output/EditableSectionCard";
import { ManagerDashboard } from "@/components/output/ManagerDashboard";
import { SectionNav } from "@/components/output/SectionNav";
import { AppShell } from "@/components/shared/AppShell";
import { useI18n } from "@/components/shared/I18nProvider";
import { Panel } from "@/components/shared/Panel";
import { generateDocument } from "@/lib/documentGenerator";
import { createSampleSession, relocalizeSession } from "@/lib/interviewEngine";
import {
  buildManagerSessionList,
  loadDocument,
  loadSessions,
  saveDocument,
  saveSession,
  setActiveSessionId,
} from "@/lib/storage";
import { DocumentSectionId, GeneratedDocument, InterviewSession } from "@/lib/types";

export function OutputReviewExperience() {
  const { dictionary, language } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSessionId = searchParams.get("session");
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [activeSectionId, setActiveSectionId] =
    useState<DocumentSectionId>("role-overview");
  const [showDemoNotice, setShowDemoNotice] = useState(false);

  useEffect(() => {
    let sessions = loadSessions();

    if (sessions.length === 0) {
      const sampleSession = createSampleSession(language);
      saveSession(sampleSession, { makeActive: false });
      saveDocument(generateDocument(sampleSession, language));
      sessions = [sampleSession];
      // Local dashboard notice is set after mount to reflect seeded demo availability.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowDemoNotice(true);
    } else {
      // Local dashboard notice is set after mount from persisted data.
      setShowDemoNotice(sessions.every((item) => item.source === "sample"));
    }

    if (!selectedSessionId) {
      setSession(null);
      setDocument(null);
      return;
    }

    const storedSession = sessions.find((item) => item.id === selectedSessionId) ?? null;

    if (!storedSession) {
      router.replace("/output");
      return;
    }

    const localizedSession =
      storedSession.language === language
        ? storedSession
        : relocalizeSession(storedSession, language);
    const nextDocument =
      loadDocument(localizedSession.id) && loadDocument(localizedSession.id)?.language === language
        ? (loadDocument(localizedSession.id) as GeneratedDocument)
        : generateDocument(localizedSession, language);

    setActiveSessionId(localizedSession.id);
    saveSession(localizedSession, { makeActive: false });
    saveDocument(nextDocument);
    setSession(localizedSession);
    setDocument(nextDocument);
    setActiveSectionId(nextDocument.sections[0]?.id ?? "role-overview");
  }, [language, router, selectedSessionId]);

  const dashboardItems = buildManagerSessionList(language);

  function handleOpenSession(sessionId: string) {
    router.push(`/output?session=${sessionId}`);
  }

  function handleEdit(value: string) {
    setDocument((current) => {
      if (!current) {
        return current;
      }

      const nextDocument = {
        ...current,
        updatedAt: new Date().toISOString(),
        sections: current.sections.map((section) =>
          section.id === activeSectionId
            ? { ...section, editableText: value }
            : section,
        ),
      };

      saveDocument(nextDocument);
      return nextDocument;
    });
  }

  function handleExport() {
    window.print();
  }

  if (!selectedSessionId || !session || !document) {
    return (
      <AppShell>
        <DocumentTopBar
          subtitle={dictionary.output.dashboardSubtitle}
          backHref="/"
          backLabel={dictionary.common.backToHome}
        />

        {showDemoNotice ? (
          <Panel className="mt-6 border-dashed bg-white/60 print-hidden">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              {dictionary.common.demoLoaded}
            </p>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
              {dictionary.output.autoDemoBody}
            </p>
          </Panel>
        ) : null}

        <ManagerDashboard items={dashboardItems} onOpen={handleOpenSession} />
      </AppShell>
    );
  }

  const activeSection =
    document.sections.find((section) => section.id === activeSectionId) ??
    document.sections[0];

  return (
    <AppShell>
      <DocumentTopBar
        subtitle={`${session.firstName} ${session.lastName}`.trim() || document.subtitle}
        generatedAt={document.updatedAt}
        onExport={handleExport}
        backHref="/output"
        backLabel={dictionary.output.backToDashboard}
      />

      <div className="mt-8 grid flex-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <DocumentSummaryPanel summary={document.sessionSummary} />
          <Panel className="print-hidden">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              {dictionary.output.sections}
            </p>
            <SectionNav
              sections={document.sections}
              activeSectionId={activeSection.id}
              onSelect={setActiveSectionId}
            />
          </Panel>
        </aside>
        <EditableSectionCard section={activeSection} onEdit={handleEdit} />
      </div>
    </AppShell>
  );
}
