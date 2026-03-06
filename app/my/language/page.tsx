"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { withViewTransition } from "@/lib/view-transition";
import i18n from "@/lib/i18n";
import { getStoredLanguage, setStoredLanguage, type Language } from "@/lib/i18n-storage";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const LANGUAGE_OPTIONS = [
  { code: "ko", labelKey: "languages.koNative" },
  { code: "en", labelKey: "languages.enNative" },
  { code: "zh", labelKey: "languages.zhNative" },
] as const;

/** 마이페이지 - 언어설정 (Figma 1115-10894) */
export default function MyLanguagePage() {
  useHeaderBackground("white");
  const router = useRouter();
  const { t } = useTranslation();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [initialCode, setInitialCode] = useState<Language>(() => getStoredLanguage());
  const [languageCode, setLanguageCode] = useState<Language>(() => getStoredLanguage());

  const canSubmit = languageCode !== initialCode;

  const handleSave = async () => {
    if (!canSubmit) return;

    setStoredLanguage(languageCode);
    document.documentElement.lang = languageCode;
    await i18n.changeLanguage(languageCode);
    setInitialCode(languageCode);
    withViewTransition(() => router.push("/my"));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <form
        id="language-form"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-4 transition-[padding-bottom] duration-250 ease-out"
        style={{
          paddingBottom:
            effectiveKeyboardInset > 0
              ? `calc(112px + ${effectiveKeyboardInset}px + var(--safe-area-inset-bottom, 0px))`
              : "calc(112px + var(--safe-area-inset-bottom, 0px))",
        }}
      >
        <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
          {t("my.languagePage.title")}
        </h1>

        <div className="mt-2 flex flex-col gap-2">
          <span className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary">
            {t("my.languagePage.label")}
          </span>
          <div className="flex flex-col gap-2">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguageCode(opt.code)}
                className="flex items-center gap-3 py-1 text-ds-body-16-r leading-ds-body-16-r text-ds-primary"
              >
                <span
                  className={
                    "flex h-5 w-5 items-center justify-center rounded-full border-2" +
                    (languageCode === opt.code
                      ? " border-primary"
                      : " border-(--border,rgba(23,25,28,0.16))")
                  }
                  aria-hidden
                >
                  {languageCode === opt.code && (
                    <span className="block h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </span>
                <span>{t(opt.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>
      </form>

      <div
        className="fixed left-0 right-0 z-10 bg-white pt-4 pb-4 transition-[bottom] duration-250 ease-out"
        style={{
          bottom:
            effectiveKeyboardInset > 0
              ? `${effectiveKeyboardInset}px`
              : "calc(32px + var(--safe-area-inset-bottom, 0px))",
          maxWidth: "var(--app-max-width)",
          margin: "0 auto",
        }}
      >
        <div className="px-4">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleSave}
            className={
              "h-auto w-full rounded-md py-3 text-ds-body-16-sb leading-ds-body-16-sb" +
              (canSubmit
                ? " text-white"
                : " bg-(--ds-bg-disabled) text-ds-disabled hover:bg-(--ds-bg-disabled) active:bg-(--ds-bg-disabled)")
            }
            disabled={!canSubmit}
          >
            {t("my.languagePage.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
