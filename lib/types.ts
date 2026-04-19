import { Language } from "@/lib/i18n";

export type InterviewSectionId =
  | "role-overview"
  | "recurring-responsibilities"
  | "step-by-step-tasks"
  | "problem-solving"
  | "tools-files"
  | "wrap-up";

export type DocumentSectionId =
  | "role-overview"
  | "procedures"
  | "troubleshooting"
  | "tools-files"
  | "open-questions";

export type MessageRole = "assistant" | "user";

export type SignalTag =
  | "tasks captured"
  | "problems captured"
  | "tools mentioned"
  | "contacts mentioned"
  | "examples captured";

export type InterviewSectionStatus = "current" | "upcoming" | "complete";
export type CompletenessStatus = "strong" | "partial" | "needs clarification";

export interface InterviewMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  sectionId: InterviewSectionId;
  detectedSignals: SignalTag[];
}

export interface InterviewSection {
  id: InterviewSectionId;
  title: string;
  status: InterviewSectionStatus;
  promptCount: number;
  completionHint: string;
}

export interface InterviewSession {
  id: string;
  language: Language;
  firstName: string;
  lastName: string;
  roleTitle: string;
  participantLabel: string;
  currentSectionId: InterviewSectionId;
  messages: InterviewMessage[];
  sections: InterviewSection[];
  answeredPromptCount: number;
  completionPercent: number;
  detectedSignals: SignalTag[];
  source: "blank" | "sample" | "live";
  updatedAt: string;
}

export interface ManagerSessionListItem {
  id: string;
  firstName: string;
  lastName: string;
  roleTitle: string;
  completionPercent: number;
  updatedAt: string;
  completedSections: number;
  totalSections: number;
  status: "not started" | "in progress" | "done";
}

export interface DocumentField {
  label: string;
  value: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  body: string;
  fields: DocumentField[];
  metadata: string[];
  status: CompletenessStatus;
}

export interface DocumentSection {
  id: DocumentSectionId;
  title: string;
  summary: string;
  items: DocumentItem[];
  editableText: string;
  status: CompletenessStatus;
  confidenceScore: number;
}

export interface OpenQuestion {
  id: string;
  prompt: string;
  reason: string;
  relatedSectionId: InterviewSectionId;
  status: "open" | "resolved";
  nextStep: string;
}

export interface ResponsibilitySummary {
  id: string;
  title: string;
  frequency: string;
  trigger: string;
  steps: string[];
  checks: string[];
  decisionLogic: string[];
  tribalKnowledge: string[];
  ownerDependencies: string[];
  risks: string[];
  commonMistakes: string[];
  example: string;
  status: CompletenessStatus;
}

export interface ToolSummary {
  id: string;
  name: string;
  purpose: string;
  whenUsed: string;
  whereItLives: string;
  riskIfMissing: string;
  primaryUsers: string[];
  backupContact: string;
  status: CompletenessStatus;
}

export interface IssueSummary {
  id: string;
  issue: string;
  signs: string[];
  firstChecks: string[];
  typicalFix: string;
  practicalShortcut: string;
  commonMistakes: string[];
  escalationCondition: string;
  escalationPath: string;
  status: CompletenessStatus;
}

export interface SessionSummary {
  id: string;
  sessionId: string;
  mainRole: string;
  detectedResponsibilities: ResponsibilitySummary[];
  detectedTools: ToolSummary[];
  detectedIssues: IssueSummary[];
  detectedGaps: OpenQuestion[];
  keyContacts: string[];
  overallStatus: CompletenessStatus;
}

export interface GeneratedDocument {
  id: string;
  sessionId: string;
  language: Language;
  title: string;
  subtitle: string;
  sessionSummary: SessionSummary;
  sections: DocumentSection[];
  openQuestions: OpenQuestion[];
  generatedAt: string;
  updatedAt: string;
}
