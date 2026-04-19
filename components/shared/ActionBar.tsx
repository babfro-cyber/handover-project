import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ActionBarProps {
  children: ReactNode;
  className?: string;
}

export function ActionBar({ children, className }: ActionBarProps) {
  return <div className={cn("flex flex-wrap gap-3", className)}>{children}</div>;
}
