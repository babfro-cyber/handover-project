"use client";

import { useI18n } from "@/components/shared/I18nProvider";
import { Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  compact?: boolean;
}

export function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { language, setLanguage, dictionary } = useI18n();

  function renderButton(target: Language) {
    const isActive = language === target;

    return (
      <button
        type="button"
        onClick={() => setLanguage(target)}
        className={cn(
          "rounded-full px-3 py-1.5 text-sm font-semibold",
          isActive ? "bg-accent text-white" : "text-muted hover:bg-surface-strong",
        )}
      >
        {dictionary.languageToggle[target]}
      </button>
    );
  }

  if (compact) {
    return (
      <div className="inline-flex items-center rounded-full border border-border bg-surface p-1">
        {renderButton("fr")}
        {renderButton("en")}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-2">
      {renderButton("fr")}
      {renderButton("en")}
    </div>
  );
}
