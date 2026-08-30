"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "fr" | "ar";

type LocaleContextValue = {
  locale: Locale;
  isArabic: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  text: (fr: string, ar: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("doctech_locale");
    if (saved === "ar" || saved === "fr") {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    const isArabic = locale === "ar";

    window.localStorage.setItem("doctech_locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.dataset.locale = locale;
    document.body.dir = isArabic ? "rtl" : "ltr";
    document.body.dataset.locale = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      isArabic: locale === "ar",
      setLocale(localeValue) {
        setLocaleState(localeValue);
      },
      toggleLocale() {
        setLocaleState((current) => (current === "fr" ? "ar" : "fr"));
      },
      text(fr, ar) {
        return locale === "ar" ? ar : fr;
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale doit être utilisé dans LocaleProvider");
  return context;
}
