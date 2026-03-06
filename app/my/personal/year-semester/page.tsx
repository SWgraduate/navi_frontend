"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { withViewTransition } from "@/lib/view-transition";
import { MOCK_PERSONAL_INFO } from "@/lib/mock-accounts";
import {
  personalYearSemesterSchema,
  type PersonalYearSemesterValue,
} from "@/lib/schemas/personal-info";
import { YearSemesterSheet } from "@/components/personal/year-semester-sheet";
import { useTranslation } from "react-i18next";

/** 마이페이지 - 현재 이수한 학년/학기 수정 */
export default function MyPersonalYearSemesterPage() {
  useHeaderBackground("white");
  const router = useRouter();
  const { t } = useTranslation();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const formatValueToDisplay = (value: string): string => {
    if (!value || !value.includes("-")) return "";
    const [y, s] = value.split("-").map(Number);
    return t("my.personal.yearSemesterPage.display", { y, s });
  };

  const initialValue = MOCK_PERSONAL_INFO.yearSemester;

  const [yearSemester, setYearSemester] = useState<PersonalYearSemesterValue | "">(initialValue);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const hasError = useMemo(
    () => touched && !personalYearSemesterSchema.safeParse(yearSemester).success,
    [yearSemester, touched]
  );
  const canSubmit = useMemo(
    () => personalYearSemesterSchema.safeParse(yearSemester).success,
    [yearSemester]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    // TODO: 실제 API 연동 및 상태 저장
    withViewTransition(() => router.back());
  };

  const display = formatValueToDisplay(yearSemester);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <form
        id="personal-year-semester-form"
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
          {t("my.personal.yearSemesterPage.title")}
        </h1>

        <div className="mt-2 flex flex-col gap-2">
          <label
            htmlFor="personal-year-semester-trigger"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            {t("my.personal.yearSemesterPage.label")}
          </label>
          <button
            id="personal-year-semester-trigger"
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex w-full items-center rounded-md border border-border bg-(--ds-gray-5) p-4 text-left text-ds-body-16-r leading-ds-body-16-r focus:outline-none focus:ring-0"
          >
            <span className={display ? "text-ds-primary" : "text-ds-tertiary"}>
              {display || t("my.personal.yearSemesterPage.placeholder")}
            </span>
          </button>
          {hasError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {t("my.personal.yearSemesterPage.error")}
            </p>
          )}
        </div>
      </form>

      {/* 학년/학기 선택 바텀시트 – 회원가입 6단계와 동일 패턴 재사용 */}
      <YearSemesterSheet
        open={sheetOpen}
        value={yearSemester}
        onOpenChange={setSheetOpen}
        onChange={(next) => {
          setYearSemester(next as PersonalYearSemesterValue);
          setTouched(true);
        }}
      />

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
            form="personal-year-semester-form"
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
            {t("my.personal.yearSemesterPage.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
