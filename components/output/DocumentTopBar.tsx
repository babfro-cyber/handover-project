"use client";

import Link from "next/link";

import { useI18n } from "@/components/shared/I18nProvider";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { ActionBar } from "@/components/shared/ActionBar";
import { Button } from "@/components/shared/Button";
import { formatDateTime } from "@/lib/utils";

interface DocumentTopBarProps {
  subtitle: string;
  generatedAt?: string;
  onExport?: () => void;
  backHref: string;
  backLabel: string;
}

export function DocumentTopBar({
  subtitle,
  generatedAt,
  onExport,
  backHref,
  backLabel,
}: DocumentTopBarProps) {
  const { dictionary, dateLocale } = useI18n();

  return (
    <header className="print-hidden flex items-start justify-between gap-6 border-b border-border pb-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
          {dictionary.output.areaLabel}
        </p>
        <h1 className="mt-3 font-serif text-5xl text-foreground">
          {dictionary.output.title}
        </h1>
        <p className="mt-3 text-xl leading-8 text-muted">{subtitle}</p>
        <p className="mt-2 max-w-3xl text-base leading-7 text-muted">
          {dictionary.output.subtitle}
        </p>
        {generatedAt ? (
          <p className="mt-2 text-sm text-muted">
            {dictionary.output.lastGenerated}: {formatDateTime(generatedAt, dateLocale)}
          </p>
        ) : null}
      </div>
      <ActionBar className="shrink-0">
        <LanguageToggle />
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] font-semibold text-foreground hover:bg-surface-strong"
        >
          {dictionary.common.backToHome}
        </Link>
        <Link
          href={backHref}
          className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] font-semibold text-foreground hover:bg-surface-strong"
        >
          {backLabel}
        </Link>
        {onExport ? <Button onClick={onExport}>{dictionary.output.exportPdf}</Button> : null}
      </ActionBar>
    </header>
  );
}
