"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { upsertMyProfile, type StudentResponse, type UpsertProfileRequest } from "@/lib/api/student";
import { updateProfileCache } from "@/hooks/use-profile";
import { withViewTransition } from "@/lib/view-transition";

/**
 * 프로필 필드 수정 공통 훅.
 * profile 전체를 기반으로 변경 필드만 override해서 upsert 후 캐시 갱신 + 뒤로가기.
 */
export function useProfileUpdate() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = async (
    profile: StudentResponse,
    overrides: Partial<UpsertProfileRequest>
  ): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await upsertMyProfile({
        admissionYear: profile.admissionYear,
        studentNumber: profile.studentNumber,
        name: profile.name,
        major: profile.major,
        secondMajorType: profile.secondMajorType,
        secondMajor: profile.secondMajor,
        academicStatus: profile.academicStatus,
        completedSemesters: profile.completedSemesters,
        isTransfer: profile.isTransfer,
        ...overrides,
      });
      updateProfileCache(result as StudentResponse);
      withViewTransition(() => router.back());
    } catch {
      setSubmitError(t("errors.saveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitError, update };
}
