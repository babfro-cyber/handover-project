import { describe, expect, it } from "vitest";

import { generateDocument } from "./documentGenerator";
import {
  advanceInterview,
  createSampleSession,
} from "./interviewEngine";

describe("documentGenerator", () => {
  it("creates all core sections from the sample session", () => {
    const document = generateDocument(createSampleSession("en"), "en");

    expect(document.sections.map((section) => section.id)).toEqual([
      "role-overview",
      "procedures",
      "troubleshooting",
      "tools-files",
      "open-questions",
    ]);
  });

  it("dedupes tool and file entries into stable cards", () => {
    const document = generateDocument(createSampleSession("en"), "en");
    const toolsSection = document.sections.find(
      (section) => section.id === "tools-files",
    );

    expect(toolsSection?.items.map((item) => item.title)).toContain(
      "HydTrack service board",
    );
    expect(toolsSection?.items.map((item) => item.title)).toContain(
      "Supplier pricing workbook",
    );
  });

  it("builds troubleshooting cards from issue language", () => {
    const document = generateDocument(createSampleSession("en"), "en");
    const troubleshooting = document.sections.find(
      (section) => section.id === "troubleshooting",
    );

    expect(troubleshooting?.items.length).toBeGreaterThan(0);
    expect(troubleshooting?.items[0]?.fields.some((field) => field.label === "First checks")).toBe(
      true,
    );
    expect(
      troubleshooting?.items[0]?.fields.some((field) => field.label === "Escalation path"),
    ).toBe(true);
  });

  it("creates open questions when information stays vague", () => {
    const session = advanceInterview(
      createSampleSession("en"),
      "It usually depends on the job and sometimes on the customer.",
      "en",
    );
    const document = generateDocument(session, "en");

    expect(document.openQuestions.some((question) => question.nextStep.length > 10)).toBe(true);
  });

  it("adds completeness cues to each generated section", () => {
    const document = generateDocument(createSampleSession("en"), "en");

    expect(document.sections.every((section) => section.status)).toBe(true);
    expect(document.sections.every((section) => section.confidenceScore >= 0)).toBe(true);
  });
});
