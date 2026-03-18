"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { useProfile } from "@/hooks/use-profile";
import { useProfileUpdate } from "@/hooks/use-profile-update";
import { inferAdmissionYear } from "@/lib/academic-options";
import { personalStudentIdSchema } from "@/lib/schemas/personal-info";
import { useTranslation } from "react-i18next";

/** 마이페이지 - 학번 수정 */
export default function MyPersonalStudentIdPage() {
  useHeaderBackground("white");
  const { t } = useTranslation();
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));
  const { profile } = useProfile();
  const { isSubmitting, submitError, update } = useProfileUpdate();

  const [localStudentId, setLocalStudentId] = useState<string | null>(null);
  const studentId = localStudentId ?? profile?.studentNumber ?? "";
  const [touched, setTouched] = useState(false);
  const validationResult = useMemo(() => personalStudentIdSchema.safeParse(studentId), [studentId]);

  const hasError = touched && !validationResult.success;
  const canSubmit = validationResult.success;
  const errorMessage =
    hasError && !validationResult.success
      ? t(validationResult.error.issues[0]?.message ?? "my.personal.studentIdPage.error")
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit || !profile) return;
    const newStudentNumber = studentId.trim();
    await update(profile, {
      admissionYear: inferAdmissionYear(newStudentNumber),
      studentNumber: newStudentNumber,
    });
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
          {t("my.personal.studentIdPage.title")}
        </h1>

        <div className="mt-2 flex flex-col gap-2">
          <label
            htmlFor="personal-student-id"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            {t("my.personal.studentIdPage.label")}
          </label>
          <div className="flex items-center rounded-md border border-border bg-(--ds-gray-5)">
            <input
              id="personal-student-id"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={studentId}
              onChange={(e) => setLocalStudentId(e.target.value)}
              onBlur={() => setTouched(true)}
              className="min-w-0 flex-1 bg-transparent p-4 text-ds-body-16-r leading-ds-body-16-r text-ds-primary placeholder:text-ds-tertiary focus:outline-none focus:ring-0"
              placeholder={t("my.personal.studentIdPage.placeholder")}
            />
          </div>
          {errorMessage && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {errorMessage}
            </p>
          )}
          {submitError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {submitError}
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
              : " bg-(--ds-bg-disabled) text-ds-disabled hover:bg-(--ds-bg-disabled) active:bg-(--ds-bg-disabled)")
          }
          disabled={!canSubmit || isSubmitting}
          >
          {isSubmitting ? t("common.loading") : t("my.personal.studentIdPage.submit")}
        </Button>
      </div>
    </div>
  );
}
