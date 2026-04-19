"use client";

import { useI18n } from "@/components/shared/I18nProvider";
import { Panel } from "@/components/shared/Panel";
import { SectionChip } from "@/components/shared/SectionChip";
import { InterviewMessage } from "@/lib/types";

interface ConversationPaneProps {
  messages: InterviewMessage[];
  activeQuestion: string;
  currentSectionTitle: string;
}

export function ConversationPane({
  messages,
  activeQuestion,
  currentSectionTitle,
}: ConversationPaneProps) {
  const { dictionary } = useI18n();
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  return (
    <Panel className="overflow-hidden px-7 py-7 lg:px-10 lg:py-10">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          {dictionary.interview.currentQuestion}
        </p>
        <SectionChip label={currentSectionTitle} tone="active" />
      </div>

      <div className="mt-6">
        <p className="max-w-4xl font-serif text-[36px] leading-[1.18] text-foreground lg:text-[52px]">
          {activeQuestion}
        </p>
      </div>

      {latestUserMessage ? (
        <div className="mt-8 max-w-3xl rounded-[24px] border border-border/80 bg-white/80 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {dictionary.interview.latestResponse}
          </p>
          <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-base leading-7 text-muted">
            {latestUserMessage.content}
          </p>
        </div>
      ) : null}
    </Panel>
  );
}
