import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="min-h-screen px-6 py-8 lg:px-10 lg:py-10">
      <div
        className={cn(
          "mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1480px] flex-col rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_60px_rgba(52,43,28,0.08)] backdrop-blur lg:p-8",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
