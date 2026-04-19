"use client";

import { useI18n } from "@/components/shared/I18nProvider";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DocumentSectionId, DocumentSection as DocumentSectionType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SectionNavProps {
  sections: DocumentSectionType[];
  activeSectionId: DocumentSectionId;
  onSelect: (sectionId: DocumentSectionId) => void;
}

export function SectionNav({
  sections,
  activeSectionId,
  onSelect,
}: SectionNavProps) {
  const { dictionary, language } = useI18n();

  return (
    <nav className="print-hidden space-y-2">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onSelect(section.id)}
          className={cn(
            "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left",
            section.id === activeSectionId
              ? "border-accent bg-accent-soft text-accent-ink"
              : "border-border bg-surface text-foreground hover:bg-surface-strong",
          )}
        >
          <div>
            <span className="font-semibold">{section.title}</span>
            <p className="mt-1 text-sm text-muted">
              {section.items.length}{" "}
              {language === "fr"
                ? `élément${section.items.length > 1 ? "s" : ""}`
                : section.items.length === 1
                  ? "item"
                  : dictionary.output.itemsCount}
            </p>
          </div>
          <StatusBadge status={section.status} />
        </button>
      ))}
    </nav>
  );
}
