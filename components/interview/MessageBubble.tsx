"use client";

import { useI18n } from "@/components/shared/I18nProvider";
import { InterviewMessage } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

interface MessageBubbleProps {
  message: InterviewMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { dateLocale, language } = useI18n();
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[78%] rounded-[28px] px-5 py-4 shadow-[0_10px_24px_rgba(52,43,28,0.06)]",
          isAssistant
            ? "rounded-bl-md border border-border bg-surface"
            : "rounded-br-md bg-accent text-white",
        )}
      >
        <div className="mb-2 flex items-center gap-3">
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.16em]",
              isAssistant ? "text-muted" : "text-white/80",
            )}
          >
            {isAssistant ? "Guide" : language === "fr" ? "Vous" : "You"}
          </span>
          <span
            className={cn(
              "text-xs",
              isAssistant ? "text-muted/80" : "text-white/70",
            )}
          >
            {formatDateTime(message.createdAt, dateLocale)}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-[18px] leading-8">{message.content}</p>
      </div>
    </div>
  );
}
