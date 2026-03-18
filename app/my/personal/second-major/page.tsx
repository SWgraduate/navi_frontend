"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { useProfile } from "@/hooks/use-profile";
import { useProfileUpdate } from "@/hooks/use-profile-update";
import { MajorSelectSheet } from "@/components/personal/major-select-sheet";
import { useTranslation } from "react-i18next";
import {
  getMajorLabel,
  getMajorOptions,
  getSecondMajorTypeLabel,
  getSecondMajorTypeOptions,
  apiSecondMajorTypeToCode,
  codeToApiSecondMajorType,
  type MajorCode,
  type SecondMajorTypeCode,
} from "@/lib/academic-options";
import type { SecondMajorType } from "@/lib/api/student";

function DownIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UpDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M7 15L12 20L17 15"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 9L12 4L17 9"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 마이페이지 - 제2전공 수정 (회원가입 제2전공 선택 컴포넌트 재사용) */
export default function MyPersonalSecondMajorPage() {
  useHeaderBackground("white");
  const { t } = useTranslation();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));
  const majorOptions = useMemo(() => getMajorOptions(t), [t]);
  const secondMajorTypeOptions = useMemo(() => getSecondMajorTypeOptions(t), [t]);
  const { profile } = useProfile();
  const { isSubmitting, submitError, update } = useProfileUpdate();

  const [localSecondMajorType, setLocalSecondMajorType] = useState<SecondMajorTypeCode | "" | null>(null);
  const [localSecondMajor, setLocalSecondMajor] = useState<MajorCode | "" | null>(null);
  const secondMajorType = localSecondMajorType ?? (profile ? apiSecondMajorTypeToCode(profile.secondMajorType as SecondMajorType) : "");
  const secondMajor = localSecondMajor ?? ((profile?.secondMajor ?? "") as MajorCode | "");
  const [secondMajorSheetOpen, setSecondMajorSheetOpen] = useState(false);
  const [secondMajorPickerOpen, setSecondMajorPickerOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const hasTypeError = touched && !secondMajorType;
  const hasMajorError = touched && !secondMajor;
  const canSubmit = !!secondMajorType && !!secondMajor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit || !profile) return;
    await update(profile, {
      secondMajorType: codeToApiSecondMajorType(secondMajorType as SecondMajorTypeCode),
      secondMajor: secondMajor || undefined,
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <form
        id="personal-second-major-form"
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
          {t("my.personal.secondMajorPage.title")}
        </h1>

        {/* 제2전공 유형 */}
        <div className="mt-2 flex flex-col gap-2">
          <label
            htmlFor="personal-second-major-type-trigger"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            {t("my.personal.secondMajorPage.typeLabel")}
          </label>
          <button
            id="personal-second-major-type-trigger"
            type="button"
            onClick={() => setSecondMajorPickerOpen(true)}
            className="relative flex w-full items-center justify-between rounded-md border border-border bg-(--ds-gray-5) p-4 pr-10 text-left text-ds-body-16-r leading-ds-body-16-r focus:outline-none focus:ring-0"
          >
            <span className={secondMajorType ? "text-ds-primary" : "text-ds-tertiary"}>
              {getSecondMajorTypeLabel(t, secondMajorType) || t("my.personal.secondMajorPage.typePlaceholder")}
            </span>
            <span className="absolute right-3 flex h-6 w-6 items-center justify-center">
              <DownIcon className="h-6 w-6 text-ds-tertiary" />
            </span>
          </button>
          {hasTypeError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {t("my.personal.secondMajorPage.typeError")}
            </p>
          )}
        </div>

        {/* 제2전공 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="personal-second-major-picker-trigger"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            {t("my.personal.secondMajorPage.majorLabel")}
          </label>
          <button
            id="personal-second-major-picker-trigger"
            type="button"
            onClick={() => setSecondMajorSheetOpen(true)}
            className="relative flex w-full items-center justify-between rounded-md border border-border bg-(--ds-gray-5) p-4 pr-10 text-left text-ds-body-16-r leading-ds-body-16-r focus:outline-none focus:ring-0"
          >
            <span className={secondMajor ? "text-ds-primary" : "text-ds-tertiary"}>
              {getMajorLabel(t, secondMajor) || t("my.personal.secondMajorPage.majorPlaceholder")}
            </span>
            <span className="absolute right-3 flex h-6 w-6 items-center justify-center">
              <UpDownIcon className="h-6 w-6 text-ds-tertiary" />
            </span>
          </button>
          {hasMajorError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {t("my.personal.secondMajorPage.majorError")}
            </p>
          )}
          {submitError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {submitError}
            </p>
          )}
        </div>
      </form>

      {/* 제2전공 유형 선택 바텀시트 – 회원가입 컴포넌트와 동일 패턴 */}
      <MajorSelectSheet
        open={secondMajorPickerOpen}
        selected={secondMajorType}
        options={secondMajorTypeOptions}
        onOpenChange={setSecondMajorPickerOpen}
        onSelect={(next) => {
          setLocalSecondMajorType(next as SecondMajorTypeCode | "");
          if (!next) setLocalSecondMajor("");
          setTouched(true);
        }}
        title={t("my.personal.secondMajorPage.typePlaceholder")}
      />

      {/* 제2전공 선택 바텀시트 – 전공 목록은 주전공과 동일 옵션 사용 (MAJOR_OPTIONS) */}
      <MajorSelectSheet
        open={secondMajorSheetOpen}
        selected={secondMajor}
        options={majorOptions}
        onOpenChange={setSecondMajorSheetOpen}
        onSelect={(next) => {
          setLocalSecondMajor(next as MajorCode | "");
          setTouched(true);
        }}
        title={t("my.personal.secondMajorPage.title")}
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
            form="personal-second-major-form"
            variant="primary"
            size="lg"
            className={
              "h-auto w-full rounded-md py-3 text-ds-body-16-sb leading-ds-body-16-sb" +
              (canSubmit
                ? " text-white"
                : " bg-(--ds-bg-disabled) text-ds-disabled hover:bg-(--ds-bg-disabled) active:bg-(--ds-bg-disabled)")
            }
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? t("common.loading") : t("my.personal.secondMajorPage.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
