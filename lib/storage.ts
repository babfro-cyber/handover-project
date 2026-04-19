import { STORAGE_KEYS } from "@/lib/mockData";
import {
  GeneratedDocument,
  InterviewSession,
  ManagerSessionListItem,
} from "@/lib/types";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseStoredValue<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function saveValue(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadSessions() {
  if (!canUseStorage()) {
    return [] as InterviewSession[];
  }

  return parseStoredValue<InterviewSession[]>(
    window.localStorage.getItem(STORAGE_KEYS.sessions),
    [],
  );
}

export function saveSessions(sessions: InterviewSession[]) {
  saveValue(STORAGE_KEYS.sessions, sessions);
}

export function loadDocuments() {
  if (!canUseStorage()) {
    return [] as GeneratedDocument[];
  }

  return parseStoredValue<GeneratedDocument[]>(
    window.localStorage.getItem(STORAGE_KEYS.documents),
    [],
  );
}

export function saveDocuments(documents: GeneratedDocument[]) {
  saveValue(STORAGE_KEYS.documents, documents);
}

export function loadActiveSessionId() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEYS.activeSessionId);
}

export function setActiveSessionId(sessionId: string | null) {
  if (!canUseStorage()) {
    return;
  }

  if (!sessionId) {
    window.localStorage.removeItem(STORAGE_KEYS.activeSessionId);
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.activeSessionId, sessionId);
}

export function loadSession(sessionId?: string | null) {
  const sessions = loadSessions();
  const targetId = sessionId ?? loadActiveSessionId();

  if (!targetId) {
    return null;
  }

  return sessions.find((session) => session.id === targetId) ?? null;
}

export function saveSession(session: InterviewSession, options?: { makeActive?: boolean }) {
  const sessions = loadSessions();
  const existingIndex = sessions.findIndex((item) => item.id === session.id);
  const nextSessions =
    existingIndex >= 0
      ? sessions.map((item) => (item.id === session.id ? session : item))
      : [session, ...sessions];

  saveSessions(nextSessions);

  if (options?.makeActive !== false) {
    setActiveSessionId(session.id);
  }
}

export function removeSession(sessionId: string) {
  saveSessions(loadSessions().filter((session) => session.id !== sessionId));
  saveDocuments(loadDocuments().filter((document) => document.sessionId !== sessionId));

  if (loadActiveSessionId() === sessionId) {
    setActiveSessionId(null);
  }
}

export function clearSession() {
  setActiveSessionId(null);
}

export function loadDocument(sessionId?: string | null) {
  const documents = loadDocuments();
  const targetId = sessionId ?? loadActiveSessionId();

  if (!targetId) {
    return null;
  }

  return documents.find((document) => document.sessionId === targetId) ?? null;
}

export function saveDocument(document: GeneratedDocument) {
  const documents = loadDocuments();
  const existingIndex = documents.findIndex((item) => item.sessionId === document.sessionId);
  const nextDocuments =
    existingIndex >= 0
      ? documents.map((item) => (item.sessionId === document.sessionId ? document : item))
      : [document, ...documents];

  saveDocuments(nextDocuments);
}

export function clearDocument(sessionId?: string | null) {
  const targetId = sessionId ?? loadActiveSessionId();

  if (!targetId) {
    return;
  }

  saveDocuments(loadDocuments().filter((document) => document.sessionId !== targetId));
}

export function buildManagerSessionList(language: "fr" | "en") {
  return loadSessions()
    .map<ManagerSessionListItem>((session) => {
      const completedSections = session.sections.filter(
        (section) => section.status === "complete",
      ).length;
      const totalSections = session.sections.length;
      const isDone =
        session.source === "sample" ||
        (session.currentSectionId === "wrap-up" && session.answeredPromptCount > 0);
      const status: ManagerSessionListItem["status"] =
        isDone
          ? "done"
          : session.answeredPromptCount > 0
            ? "in progress"
            : "not started";

      return {
        id: session.id,
        firstName: session.firstName || (session.source === "sample" ? "Jean" : ""),
        lastName: session.lastName || (session.source === "sample" ? "Dupont" : ""),
        roleTitle:
          session.roleTitle ||
          (language === "fr" ? "Entretien sans titre" : "Untitled interview"),
        completionPercent: isDone ? 100 : session.completionPercent,
        updatedAt: session.updatedAt,
        completedSections,
        totalSections,
        status,
      };
    })
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}
