"use client";

import { useI18n } from "@/components/shared/I18nProvider";
import { Panel } from "@/components/shared/Panel";
import { ManagerSessionListItem } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface ManagerDashboardProps {
  items: ManagerSessionListItem[];
  onOpen: (sessionId: string) => void;
}

export function ManagerDashboard({ items, onOpen }: ManagerDashboardProps) {
  const { dictionary, dateLocale } = useI18n();

  return (
    <div className="mt-8 space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
          {dictionary.output.people}
        </p>
        <h2 className="mt-3 font-serif text-4xl text-foreground">
          {dictionary.output.dashboardTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-muted">
          {dictionary.output.dashboardSubtitle}
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const fullName = `${item.firstName} ${item.lastName}`.trim();
          const statusLabel =
            item.status === "done"
              ? dictionary.output.done
              : item.status === "in progress"
                ? dictionary.output.inProgress
                : dictionary.output.notStarted;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item.id)}
              className="block w-full text-left"
            >
              <Panel className="hover:bg-surface-strong">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">{fullName}</h3>
                    <p className="mt-2 text-base leading-7 text-muted">{item.roleTitle}</p>
                  </div>
                  <span className="rounded-full border border-border bg-white px-3 py-1 text-sm font-semibold text-muted">
                    {statusLabel}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {dictionary.output.progressLabel}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {Math.max(item.completionPercent, 0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {dictionary.output.sectionsDone}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {item.completedSections}/{item.totalSections}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {dictionary.output.lastUpdated}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {formatDateTime(item.updatedAt, dateLocale)}
                    </p>
                  </div>
                  <div className="flex items-end justify-start md:justify-end">
                    <span className="text-sm font-semibold text-accent-ink">
                      {dictionary.output.openFile}
                    </span>
                  </div>
                </div>
              </Panel>
            </button>
          );
        })}
      </div>
    </div>
  );
}
