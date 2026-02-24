"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { withViewTransition } from "@/lib/view-transition";
import { useRouter } from "next/navigation";

const LANGUAGE_OPTIONS = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
] as const;

/** 마이페이지 - 언어설정 (Figma 1115-10894) */
export default function MyLanguagePage() {
  useHeaderBackground("white");
  const router = useRouter();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const initialCode: (typeof LANGUAGE_OPTIONS)[number]["code"] = "ko";
  const [languageCode, setLanguageCode] = useState<(typeof LANGUAGE_OPTIONS)[number]["code"]>(
    initialCode
  );

  const canSubmit = languageCode !== initialCode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // TODO: 실제 API 연동 및 언어 설정 저장
    withViewTransition(() => router.back());
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-4 transition-[padding-bottom] duration-250 ease-out"
        style={{
          paddingBottom:
            effectiveKeyboardInset > 0
              ? `calc(112px + ${effectiveKeyboardInset}px + var(--safe-area-inset-bottom, 0px))`
              : "calc(112px + var(--safe-area-inset-bottom, 0px))",
        }}
      >
        <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
          언어설정을 선택해주세요
        </h1>

        <div className="mt-2 flex flex-col gap-2">
          <span className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary">
            언어설정
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
                <span>{opt.label}</span>
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
            type="submit"
            form="language-form"
            variant="primary"
            size="lg"
            className={
              "h-auto w-full rounded-md py-3 text-ds-body-16-sb leading-ds-body-16-sb" +
              (canSubmit
                ? " text-white"
                : " bg-(--ds-bg-disabled) text-ds-disabled hover:bg-(--ds-bg-disabled) active:bg-(--ds-bg-disabled)")
            }
            disabled={!canSubmit}
          >
            수정
          </Button>
        </div>
      </div>
    </div>
  );
}

