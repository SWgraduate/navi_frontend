"use client";

import { createContext, useContext, useEffect, useState } from "react";
import "@/lib/i18n";
import i18n from "@/lib/i18n";
import { type Language, getStoredLanguage, setStoredLanguage } from "@/lib/i18n-storage";

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue>({
  language: "ko",
  setLanguage: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => getStoredLanguage());

  useEffect(() => {
    void i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setStoredLanguage(lang);
    setLanguageState(lang);
    void i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
