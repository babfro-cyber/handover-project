import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-border bg-surface p-5 shadow-[0_12px_32px_rgba(52,43,28,0.05)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
