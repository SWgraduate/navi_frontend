"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { withViewTransition } from "@/lib/view-transition";
import { MOCK_PERSONAL_INFO } from "@/lib/mock-accounts";
import { personalAcademicStatusSchema, type PersonalAcademicStatusValue } from "@/lib/schemas/personal-info";
import { cn } from "@/lib/utils";

/** 마이페이지 - 학적상태 수정 (재학생 / 휴학생) */
export default function MyPersonalAcademicStatusPage() {
  useHeaderBackground("white");
  const router = useRouter();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const initialStatus: PersonalAcademicStatusValue | "" =
    MOCK_PERSONAL_INFO.academicStatus === "휴학생" ? "leave" : "enrolled";

  const [status, setStatus] = useState<PersonalAcademicStatusValue | "">(initialStatus);
  const [touched, setTouched] = useState(false);

  const hasError = useMemo(
    () => touched && !personalAcademicStatusSchema.safeParse(status).success,
    [status, touched]
  );
  const canSubmit = useMemo(
    () => personalAcademicStatusSchema.safeParse(status).success,
    [status]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    // TODO: 실제 API 연동 및 상태 저장
    withViewTransition(() => router.back());
  };

  const labelForStatus = (value: PersonalAcademicStatusValue) =>
    value === "enrolled" ? "재학생" : "휴학생";

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <form
        id="personal-academic-status-form"
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
          학적상태를 선택해주세요
        </h1>

        <div className="mt-2 flex flex-col gap-2">
          <span className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary">
            학적상태
          </span>
          <div className="flex gap-2">
            {(["enrolled", "leave"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setStatus(value);
                  setTouched(true);
                }}
                className={cn(
                  "flex-1 rounded-md border-2 py-3 text-ds-body-16-r leading-ds-body-16-r",
                  status === value
                    ? "border-primary bg-primary/10 text-primary"
                    : hasError
                      ? "border-destructive bg-(--ds-gray-5) text-ds-tertiary"
                      : "border-transparent bg-(--ds-gray-5) text-ds-tertiary"
                )}
              >
                {labelForStatus(value)}
              </button>
            ))}
          </div>
          {hasError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              학적상태를 선택해주세요.
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
        <div className="px-4">
          <Button
            type="submit"
            form="personal-academic-status-form"
            variant="primary"
            size="lg"
            className={
              "h-auto w-full rounded-md py-3 text-ds-body-16-sb leading-ds-body-16-sb" +
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
    </div>
  );
}

