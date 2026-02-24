"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { withViewTransition } from "@/lib/view-transition";
import { MOCK_PERSONAL_INFO } from "@/lib/mock-accounts";

/** 마이페이지 - 학번 수정 (이름 수정 페이지와 동일 패턴) */
export default function MyPersonalStudentIdPage() {
  useHeaderBackground("white");
  const router = useRouter();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [studentId, setStudentId] = useState<string>(MOCK_PERSONAL_INFO.studentId);
  const [touched, setTouched] = useState(false);

  const hasError = useMemo(
    () => touched && studentId.trim().length === 0,
    [studentId, touched]
  );
  const canSubmit = useMemo(() => studentId.trim().length > 0, [studentId]);

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
        id="personal-student-id-form"
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
          학번을 입력해주세요
        </h1>

        <div className="mt-2 flex flex-col gap-2">
          <label
            htmlFor="personal-student-id"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            학번
          </label>
          <div className="flex items-center rounded-md border border-border bg-(--ds-gray-5)">
            <input
              id="personal-student-id"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onBlur={() => setTouched(true)}
              className="min-w-0 flex-1 bg-transparent p-4 text-ds-body-16-r leading-ds-body-16-r text-ds-primary placeholder:text-ds-tertiary focus:outline-none focus:ring-0"
              placeholder="학번을 입력해주세요"
            />
          </div>
          {hasError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              학번을 입력해주세요.
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
          form="personal-student-id-form"
          variant="primary"
          size="lg"
          className={
            "h-auto w-full rounded-none py-3 text-ds-body-16-sb leading-ds-body-16-sb" +
            (canSubmit
              ? " text-white"
              : " bg-(--ds-gray-10) text-ds-disabled hover:bg-(--ds-gray-10) active:bg-(--ds-gray-10)")
          }
          disabled={!canSubmit}
        >
          수정
        </Button>
      </div>
    </div>
  );
}

