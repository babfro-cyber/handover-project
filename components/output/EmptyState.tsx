"use client";

import Link from "next/link";

import { useI18n } from "@/components/shared/I18nProvider";
import { Panel } from "@/components/shared/Panel";

export function EmptyState() {
  const { dictionary, language } = useI18n();

  return (
    <Panel className="mx-auto my-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
        {dictionary.output.areaLabel}
      </p>
      <h1 className="mt-4 font-serif text-5xl text-foreground">
        {dictionary.output.autoDemoTitle}
      </h1>
      <p className="mt-4 text-xl leading-8 text-muted">
        {dictionary.output.autoDemoBody}
      </p>
      <div className="mt-8 flex justify-center">
        <Link
          href="/interview"
          className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-[15px] font-semibold text-white hover:bg-accent-ink"
        >
          {language === "fr" ? "Ouvrir l’entretien" : "Open interview"}
        </Link>
      </div>
    </Panel>
  );
}
