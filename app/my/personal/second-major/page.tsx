"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { withViewTransition } from "@/lib/view-transition";
import { MOCK_PERSONAL_INFO } from "@/lib/mock-accounts";
import { MAJOR_OPTIONS, SECOND_MAJOR_OPTIONS } from "@/app/signup/complete/page";
import { MajorSelectSheet } from "@/components/personal/major-select-sheet";

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
  const router = useRouter();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [secondMajorType, setSecondMajorType] = useState<string>("");
  const [secondMajor, setSecondMajor] = useState<string>(MOCK_PERSONAL_INFO.secondMajor === "없음" ? "" : MOCK_PERSONAL_INFO.secondMajor);
  const [secondMajorSheetOpen, setSecondMajorSheetOpen] = useState(false);
  const [secondMajorPickerOpen, setSecondMajorPickerOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const hasTypeError = touched && !secondMajorType;
  const hasMajorError = touched && !secondMajor;
  const canSubmit = !!secondMajorType && !!secondMajor;

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
          제2전공을 선택해주세요
        </h1>

        {/* 제2전공 유형 */}
        <div className="mt-2 flex flex-col gap-2">
          <label
            htmlFor="personal-second-major-type-trigger"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            제2전공 유형
          </label>
          <button
            id="personal-second-major-type-trigger"
            type="button"
            onClick={() => setSecondMajorPickerOpen(true)}
            className="relative flex w-full items-center justify-between rounded-md border border-border bg-(--ds-gray-5) p-4 pr-10 text-left text-ds-body-16-r leading-ds-body-16-r focus:outline-none focus:ring-0"
          >
            <span className={secondMajorType ? "text-ds-primary" : "text-ds-tertiary"}>
              {secondMajorType || "제2전공 유형을 선택해주세요"}
            </span>
            <span className="absolute right-3 flex h-6 w-6 items-center justify-center">
              <DownIcon className="h-6 w-6 text-ds-tertiary" />
            </span>
          </button>
          {hasTypeError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              제2전공 유형을 선택해주세요.
            </p>
          )}
        </div>

        {/* 제2전공 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="personal-second-major-picker-trigger"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            제2전공
          </label>
          <button
            id="personal-second-major-picker-trigger"
            type="button"
            onClick={() => setSecondMajorSheetOpen(true)}
            className="relative flex w-full items-center justify-between rounded-md border border-border bg-(--ds-gray-5) p-4 pr-10 text-left text-ds-body-16-r leading-ds-body-16-r focus:outline-none focus:ring-0"
          >
            <span className={secondMajor ? "text-ds-primary" : "text-ds-tertiary"}>
              {secondMajor || "전공을 선택해주세요"}
            </span>
            <span className="absolute right-3 flex h-6 w-6 items-center justify-center">
              <UpDownIcon className="h-6 w-6 text-ds-tertiary" />
            </span>
          </button>
          {hasMajorError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              제2전공을 선택해주세요.
            </p>
          )}
        </div>
      </form>

      {/* 제2전공 유형 선택 바텀시트 – 회원가입 컴포넌트와 동일 패턴 */}
      <MajorSelectSheet
        open={secondMajorPickerOpen}
        selected={secondMajorType}
        options={SECOND_MAJOR_OPTIONS}
        onOpenChange={setSecondMajorPickerOpen}
        onSelect={(next) => {
          setSecondMajorType(next);
          if (!next) setSecondMajor("");
          setTouched(true);
        }}
        title="제2전공 유형을 선택해주세요"
      />

      {/* 제2전공 선택 바텀시트 – 전공 목록은 주전공과 동일 옵션 사용 (MAJOR_OPTIONS) */}
      <MajorSelectSheet
        open={secondMajorSheetOpen}
        selected={secondMajor}
        options={MAJOR_OPTIONS}
        onOpenChange={setSecondMajorSheetOpen}
        onSelect={(next) => {
          setSecondMajor(next);
          setTouched(true);
        }}
        title="제2전공을 선택해주세요"
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
            disabled={!canSubmit}
          >
            수정
          </Button>
        </div>
      </div>
    </div>
  );
}

