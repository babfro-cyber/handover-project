import { cn } from "@/lib/utils";

interface SectionChipProps {
  label: string;
  tone?: "neutral" | "active" | "complete";
}

export function SectionChip({ label, tone = "neutral" }: SectionChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        tone === "neutral" && "bg-surface-strong text-muted",
        tone === "active" && "bg-accent-soft text-accent-ink",
        tone === "complete" && "bg-[#ebf1e6] text-accent-ink",
      )}
    >
      {label}
    </span>
  );
}
