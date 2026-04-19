import { describe, expect, it } from "vitest";

import {
  advanceInterview,
  createBlankSession,
  createSampleSession,
} from "./interviewEngine";

describe("interviewEngine", () => {
  it("asks for more detail on short answers", () => {
    const session = createBlankSession("en");
    const next = advanceInterview(session, "I run the workshop.", "en");

    expect(next.messages.at(-1)?.content).toBe(
      "Can you give more detail or a real example from a recent job?",
    );
  });

  it("asks for the common case when language is ambiguous", () => {
    const session = createBlankSession("en");
    const next = advanceInterview(
      session,
      "It usually depends on the job type, the customer deadline, and sometimes on parts availability, but the same three patterns come up most weeks and the exact mix can vary.",
      "en",
    );

    expect(next.messages.at(-1)?.content).toContain("real example");
  });

  it("asks for trigger and checks on recurring responsibilities", () => {
    const session = createBlankSession("en");
    const withRole = advanceInterview(
      session,
      "I run the workshop side of the business and keep the schedule moving across the day. For example, last Monday I had to reorder the whole plan before 8am because an urgent job landed and one technician was away.",
      "en",
    );
    const next = advanceInterview(
      withRole,
      "Every morning I rebalance the daily schedule, chase missing paperwork, confirm bench loading, and speak with the lead technician before the team starts work.",
      "en",
    );

    expect(next.currentSectionId).toBe("recurring-responsibilities");
    expect(next.messages.at(-1)?.content).toContain("How often does that happen");
  });

  it("moves intentionally from recurring work into step-by-step tasks", () => {
    let session = createBlankSession("en");
    session = advanceInterview(
      session,
      "I run the workshop side of a small hydraulics repair business and keep the jobs, technicians, and customer expectations aligned across the week. For example, last Wednesday I had to reshuffle the whole plan before 8am when an urgent repair landed.",
      "en",
    );
    session = advanceInterview(
      session,
      "Every morning I review the live jobs, rebalance the schedule, and chase missing paperwork before technicians start.",
      "en",
    );
    session = advanceInterview(
      session,
      "That happens every day, usually when urgent jobs land or a technician is unavailable, and I check customer deadlines, bench loading, and paperwork quality before I move anything.",
      "en",
    );

    expect(session.currentSectionId).toBe("step-by-step-tasks");
    expect(session.messages.at(-1)?.content).toContain("step by step");
  });

  it("asks where tools live and who relies on them", () => {
    let session = createBlankSession("en");
    session = advanceInterview(
      session,
      "I run the workshop and keep jobs, technicians, and customer expectations aligned. For example, last week I had to reshuffle the whole day before 8am when an urgent repair and a staffing gap landed at once.",
      "en",
    );
    session = advanceInterview(
      session,
      "Every morning I review the open jobs, reshuffle the live schedule, chase missing paperwork, and confirm who owns each urgent job before the technicians start.",
      "en",
    );
    session = advanceInterview(
      session,
      "That happens every day when urgent work lands or paperwork is incomplete, and I check bench loading, deadlines, job sheet quality, and technician ownership before I move anything.",
      "en",
    );
    session = advanceInterview(
      session,
      "If an urgent repair comes in, I log it, confirm the machine details, review the deadline, call the lead technician, and make sure the paperwork is complete before it reaches a bench.",
      "en",
    );
    session = advanceInterview(
      session,
      "The main issues are missing parts and vague job sheets, and I recognise them when the paperwork does not line up with the promised deadline.",
      "en",
    );
    session = advanceInterview(
      session,
      "I recognise them when the paperwork is vague, the stock is missing, or the promised finish date no longer matches the bench loading.",
      "en",
    );
    session = advanceInterview(
      session,
      "I first check the job sheet, stock, and repair history, then I escalate to purchasing or the owner if the parts or pricing risk is still unclear and the customer promise is at risk.",
      "en",
    );
    const next = advanceInterview(
      session,
      "We use a supplier pricing spreadsheet and the workshop inbox to keep quotes, supplier follow-up, and customer communication moving, but I have not named the exact folder or owner yet.",
      "en",
    );

    expect(next.messages.at(-1)?.content).toContain("Where exactly");
  });

  it("keeps the sample session complete through wrap-up", () => {
    const sample = createSampleSession("en");

    expect(sample.currentSectionId).toBe("wrap-up");
    expect(sample.completionPercent).toBeGreaterThanOrEqual(90);
    expect(sample.answeredPromptCount).toBeGreaterThanOrEqual(8);
    expect(sample.messages.at(-1)?.content).toContain("Generate documentation");
  });
});
