"use client";

import { useI18n } from "@/components/shared/I18nProvider";
import { CompletenessStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: CompletenessStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { dictionary } = useI18n();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        status === "strong" && "bg-[#e8f0e3] text-accent-ink",
        status === "partial" && "bg-[#f2ead8] text-[#6a5627]",
        status === "needs clarification" && "bg-[#f4e2de] text-[#7a4037]",
      )}
    >
      {dictionary.statuses[status]}
    </span>
  );
}
