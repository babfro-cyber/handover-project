import { describe, expect, it } from "vitest";

import { buildSessionSummary } from "./sessionSummary";
import { createSampleSession } from "./interviewEngine";

describe("sessionSummary", () => {
  it("builds a structured summary layer from the interview session", () => {
    const summary = buildSessionSummary(createSampleSession("en"));

    expect(summary.mainRole.toLowerCase()).toContain("workshop");
    expect(summary.detectedResponsibilities.length).toBeGreaterThan(2);
    expect(summary.detectedTools.length).toBeGreaterThan(2);
    expect(summary.detectedIssues.length).toBeGreaterThan(1);
  });

  it("creates actionable gaps instead of generic placeholders", () => {
    const summary = buildSessionSummary(createSampleSession("en"));

    expect(summary.detectedGaps.every((gap) => gap.prompt.length > 20)).toBe(true);
    expect(summary.detectedGaps.every((gap) => gap.nextStep.length > 15)).toBe(true);
  });
});
