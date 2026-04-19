"use client";

import { useI18n } from "@/components/shared/I18nProvider";
import { Panel } from "@/components/shared/Panel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SessionSummary } from "@/lib/types";

interface DocumentSummaryPanelProps {
  summary: SessionSummary;
}

export function DocumentSummaryPanel({
  summary,
}: DocumentSummaryPanelProps) {
  const { dictionary } = useI18n();

  return (
    <Panel className="print-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            {dictionary.output.sessionSummary}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-foreground">
            {summary.mainRole}
          </h2>
        </div>
        <StatusBadge status={summary.overallStatus} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface-strong px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {dictionary.output.responsibilities}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {summary.detectedResponsibilities.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-strong px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {dictionary.output.issues}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {summary.detectedIssues.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-strong px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {dictionary.output.tools}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {summary.detectedTools.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-strong px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {dictionary.output.gaps}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {summary.detectedGaps.length}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          {dictionary.output.keyContacts}
        </p>
        <p className="mt-3 text-base leading-7 text-muted">
          {summary.keyContacts.length > 0
            ? summary.keyContacts.join(", ")
            : dictionary.output.noContacts}
        </p>
      </div>
    </Panel>
  );
}
