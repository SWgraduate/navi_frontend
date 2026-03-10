const LANGUAGE_KEY = "navi_language";

export type Language = "ko" | "en" | "zh";

export function hasStoredLanguage(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored === "ko" || stored === "en" || stored === "zh";
}

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "ko";
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored === "ko" || stored === "en" || stored === "zh") return stored;
  return "ko";
}

export function setStoredLanguage(lang: Language): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_KEY, lang);
}
