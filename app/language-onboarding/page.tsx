"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import i18n from "@/lib/i18n";
import { setStoredLanguage, type Language } from "@/lib/i18n-storage";
import { isLoggedIn } from "@/lib/auth-storage";
import { withViewTransition } from "@/lib/view-transition";

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
];

/** First-time language selection (no i18next, English copy) */
export default function LanguageOnboardingPage() {
  useHeaderBackground("white");
  const router = useRouter();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [languageCode, setLanguageCode] = useState<Language>("ko");

  const handleContinue = async () => {
    const lang = languageCode ?? "en";
    setStoredLanguage(lang);
    document.documentElement.lang = lang;
    await i18n.changeLanguage(lang);

    const loggedIn = isLoggedIn();
    const nextPath = loggedIn ? "/home" : "/login";
    withViewTransition(() => router.replace(nextPath));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <main
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-18 pb-4 transition-[padding-bottom] duration-250 ease-out"
        style={{
          paddingBottom:
            effectiveKeyboardInset > 0
              ? `calc(112px + ${effectiveKeyboardInset}px + var(--safe-area-inset-bottom, 0px))`
              : "calc(112px + var(--safe-area-inset-bottom, 0px))",
        }}
      >
        <section className="flex flex-col gap-2">
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            Welcome!
          </h1>
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            Choose your language
          </h1>
        </section>

        <section className="mt-2 flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            {LANGUAGE_OPTIONS.map((opt) => {
              const selected = languageCode === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguageCode(opt.code)}
                  className="flex items-center gap-2 py-2 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:opacity-70"
                >
                  <span
                    className={
                      "flex h-5 w-5 items-center justify-center rounded-full border-2" +
                      (selected
                        ? " border-primary"
                        : " border-(--border,rgba(23,25,28,0.16))")
                    }
                    aria-hidden
                  >
                    {selected && (
                      <span className="block h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

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
            onClick={handleContinue}
            className="h-auto w-full rounded-md py-3 text-ds-body-16-sb leading-ds-body-16-sb text-white"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

