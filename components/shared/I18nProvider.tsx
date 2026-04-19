"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_LANGUAGE,
  getDateLocale,
  getDictionary,
  LANGUAGE_STORAGE_KEY,
  Language,
} from "@/lib/i18n";

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  dictionary: ReturnType<typeof getDictionary>;
  dateLocale: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_LANGUAGE;
    }

    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "fr" || stored === "en" ? stored : DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      dictionary: getDictionary(language),
      dateLocale: getDateLocale(language),
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
