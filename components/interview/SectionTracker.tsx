"use client";

import { useI18n } from "@/components/shared/I18nProvider";
import { InterviewSection, InterviewSectionId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SectionTrackerProps {
  sections: InterviewSection[];
}

const SECTION_LABEL_KEYS: Record<InterviewSectionId, keyof ReturnType<typeof useI18n>["dictionary"]["interview"]> = {
  "role-overview": "sectionRole",
  "recurring-responsibilities": "sectionTasks",
  "step-by-step-tasks": "sectionProcess",
  "problem-solving": "sectionProblems",
  "tools-files": "sectionTools",
  "wrap-up": "sectionDecisions",
};

export function SectionTracker({ sections }: SectionTrackerProps) {
  const { dictionary } = useI18n();

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {dictionary.interview.sectionTracker}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {sections.map((section) => (
          <div
            key={section.id}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
              section.status === "complete" && "border-[#cfdcc4] bg-[#edf3e7] text-accent-ink",
              section.status === "current" && "border-accent bg-accent-soft text-accent-ink",
              section.status === "upcoming" && "border-border bg-white text-muted",
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                section.status === "complete" && "bg-accent",
                section.status === "current" && "bg-accent",
                section.status === "upcoming" && "bg-border",
              )}
            />
            {dictionary.interview[SECTION_LABEL_KEYS[section.id]]}
          </div>
        ))}
      </div>
    </div>
  );
}
