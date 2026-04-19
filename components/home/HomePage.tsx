"use client";

import Link from "next/link";

import { AppShell } from "@/components/shared/AppShell";
import { Button } from "@/components/shared/Button";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { Panel } from "@/components/shared/Panel";
import { useI18n } from "@/components/shared/I18nProvider";

export function HomePage() {
  const { dictionary } = useI18n();

  return (
    <AppShell className="justify-center">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
            {dictionary.landing.eyebrow}
          </p>
          <p className="mt-2 text-base text-muted">{dictionary.common.appName}</p>
        </div>
        <LanguageToggle />
      </div>

      <div className="mt-10">
        <div className="max-w-4xl">
          <h1 className="font-serif text-6xl leading-[1.05] text-foreground">
            {dictionary.landing.title}
          </h1>
          <p className="mt-5 max-w-3xl text-2xl leading-9 text-muted">
            {dictionary.landing.subtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Panel className="bg-white/80">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              {dictionary.interview.areaLabel}
            </p>
            <p className="mt-3 text-lg leading-8 text-foreground">
              {dictionary.landing.interviewSurface}
            </p>
            <Link href="/interview?new=1" className="mt-5 block">
              <Button fullWidth>{dictionary.landing.startInterview}</Button>
            </Link>
          </Panel>
          <Panel className="bg-white/80">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              {dictionary.output.areaLabel}
            </p>
            <p className="mt-3 text-lg leading-8 text-foreground">
              {dictionary.landing.ownerSurface}
            </p>
            <Link href="/output" className="mt-5 block">
              <Button fullWidth variant="secondary">
                {dictionary.landing.viewOwnerArea}
              </Button>
            </Link>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
