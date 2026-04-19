"use client";

import { useI18n } from "@/components/shared/I18nProvider";
import { Panel } from "@/components/shared/Panel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TextareaField } from "@/components/shared/TextareaField";
import { DocumentSection } from "@/lib/types";

interface EditableSectionCardProps {
  section: DocumentSection;
  onEdit: (value: string) => void;
}

export function EditableSectionCard({
  section,
  onEdit,
}: EditableSectionCardProps) {
  const { dictionary } = useI18n();

  return (
    <div className="space-y-5">
      <Panel>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              {section.title}
            </p>
            <h2 className="mt-3 font-serif text-4xl text-foreground">{section.title}</h2>
          </div>
          <StatusBadge status={section.status} />
        </div>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-muted">{section.summary}</p>
        <p className="mt-4 text-sm text-muted">
          {dictionary.output.confidence}: {section.confidenceScore}%
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {section.items.map((item) => (
          <Panel key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <p className="text-xl font-semibold text-foreground">{item.title}</p>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-muted">
              {item.body}
            </p>
            {item.fields.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {item.fields.map((field) => (
                  <div key={`${item.id}-${field.label}`} className="rounded-2xl bg-surface-strong px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {field.label}
                    </p>
                    <p className="mt-2 text-base leading-7 text-foreground">{field.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {item.metadata.length > 0 ? (
              <p className="mt-4 text-sm text-muted">{item.metadata.join(" · ")}</p>
            ) : null}
          </Panel>
        ))}
      </div>

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              {dictionary.output.editableDraft}
            </p>
            <p className="mt-2 text-base leading-7 text-muted">
              {dictionary.output.editableHelp}
            </p>
          </div>
        </div>
        <TextareaField
          className="min-h-[340px] text-[17px]"
          value={section.editableText}
          onChange={(event) => onEdit(event.target.value)}
        />
      </Panel>
    </div>
  );
}
