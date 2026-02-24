"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { withViewTransition } from "@/lib/view-transition";
import { MOCK_PERSONAL_INFO } from "@/lib/mock-accounts";
import { MAJOR_OPTIONS } from "@/app/signup/complete/page";
import { MajorSelectSheet } from "@/components/personal/major-select-sheet";

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

/** 마이페이지 - 주전공 수정 (회원가입 주전공 선택 컴포넌트 재사용) */
export default function MyPersonalMajorPage() {
  useHeaderBackground("white");
  const router = useRouter();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [major, setMajor] = useState<string>(MOCK_PERSONAL_INFO.major);
  const [majorSheetOpen, setMajorSheetOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const hasError = touched && major.trim().length === 0;
  const canSubmit = major.trim().length > 0;

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
        id="personal-major-form"
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
          주전공을 선택해주세요
        </h1>

        <div className="mt-2 flex flex-col gap-2">
          <label
            htmlFor="personal-major-trigger"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            주전공
          </label>
          <button
            id="personal-major-trigger"
            type="button"
            onClick={() => setMajorSheetOpen(true)}
            className="relative flex w-full items-center justify-between rounded-md border border-border bg-(--ds-gray-5) p-4 pr-10 text-left text-ds-body-16-r leading-ds-body-16-r focus:outline-none focus:ring-0"
          >
            <span className={major ? "text-ds-primary" : "text-ds-tertiary"}>
              {major || "전공을 선택해주세요"}
            </span>
            <span className="absolute right-3 flex h-6 w-6 items-center justify-center">
              <UpDownIcon className="h-6 w-6 text-ds-tertiary" />
            </span>
          </button>
          {hasError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              주전공을 선택해주세요.
            </p>
          )}
        </div>
      </form>

      {/* 주전공 선택 바텀시트 – 회원가입 6단계와 동일 컴포넌트 사용 */}
      <MajorSelectSheet
        open={majorSheetOpen}
        selected={major}
        options={MAJOR_OPTIONS}
        onOpenChange={setMajorSheetOpen}
        onSelect={(next) => {
          setMajor(next);
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
            form="personal-major-form"
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

