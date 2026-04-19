import { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextareaField({ className, ...props }: TextareaFieldProps) {
  return (
    <textarea
      className={cn(
        "min-h-[148px] w-full rounded-[24px] border border-border bg-white px-5 py-4 text-lg leading-8 text-foreground placeholder:text-muted/80 focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}
