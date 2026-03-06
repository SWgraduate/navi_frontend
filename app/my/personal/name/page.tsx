"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { withViewTransition } from "@/lib/view-transition";
import { MOCK_PERSONAL_INFO } from "@/lib/mock-accounts";
import { personalNameSchema } from "@/lib/schemas/personal-info";
import { useTranslation } from "react-i18next";

/** Figma 1091-7200: 마이페이지 - 이름 수정 */
export default function MyPersonalNamePage() {
  useHeaderBackground("white");
  const router = useRouter();
  const { t } = useTranslation();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [name, setName] = useState<string>(MOCK_PERSONAL_INFO.name);
  const [touched, setTouched] = useState(false);
  const validationResult = useMemo(() => personalNameSchema.safeParse(name), [name]);

  const hasError = touched && !validationResult.success;
  const canSubmit = validationResult.success;
  const errorMessage =
    hasError && !validationResult.success
      ? t(validationResult.error.issues[0]?.message ?? "my.personal.namePage.error")
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    // TODO: 실제 API 연동 및 상태 저장
    withViewTransition(() => router.back());
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <form
        id="personal-name-form"
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
          {t("my.personal.namePage.title")}
        </h1>

        <div className="mt-2 flex flex-col gap-2">
          <label
            htmlFor="personal-name"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            {t("my.personal.namePage.label")}
          </label>
          <div className="flex items-center rounded-md border border-border bg-(--ds-gray-5)">
            <input
              id="personal-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              className="min-w-0 flex-1 bg-transparent p-4 text-ds-body-16-r leading-ds-body-16-r text-ds-primary placeholder:text-ds-tertiary focus:outline-none focus:ring-0"
              placeholder={t("my.personal.namePage.placeholder")}
            />
          </div>
          {errorMessage && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {errorMessage}
            </p>
          )}
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
        <Button
          type="submit"
          form="personal-name-form"
          variant="primary"
          size="lg"
          className={
            "h-auto w-full rounded-none py-3 text-ds-body-16-sb leading-ds-body-16-sb" +
            (canSubmit
              ? " text-white"
              : " bg-(--ds-bg-disabled) text-ds-disabled hover:bg-(--ds-bg-disabled) active:bg-(--ds-bg-disabled)")
          }
          disabled={!canSubmit}
          >
          {t("my.personal.namePage.submit")}
        </Button>
      </div>
    </div>
  );
}
