"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { hasGraduationResult } from "@/lib/mock-accounts";
import { withViewTransition } from "@/lib/view-transition";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const SKIP_SAVED_RESULT_KEY = "navi_skip_saved_graduation_result_once";

/** Figma 1212-11510: 졸업 관리 시작하기 화면 */
export default function GraduationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const skipSavedResult = searchParams.get("skipSavedResult") === "1";

  useEffect(() => {
    // 로컬스토리지 확인 후 라우팅 결정
    const checkAndRoute = () => {
      const shouldSkipSavedResult =
        skipSavedResult ||
        (typeof window !== "undefined" &&
          sessionStorage.getItem(SKIP_SAVED_RESULT_KEY) === "1");

      if (typeof window !== "undefined" && shouldSkipSavedResult) {
        sessionStorage.removeItem(SKIP_SAVED_RESULT_KEY);
      }

      if (!shouldSkipSavedResult && hasGraduationResult()) {
        // 저장된 데이터가 있으면 result 페이지로 리다이렉트
        withViewTransition(() => router.push("/graduation/result"));
      } else {
        // 데이터가 없으면 시작하기 화면 표시
        setIsLoading(false);
      }
    };

    // 약간의 지연을 두어 로딩 상태를 보여줌
    const timer = setTimeout(checkAndRoute, 100);
    return () => clearTimeout(timer);
  }, [router, skipSavedResult]);

  const handleStart = () => {
    withViewTransition(() => router.push("/graduation/upload"));
  };

  // 로딩 중일 때는 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div
          className="rounded-full bg-ds-gray-30 animate-pulse-scale"
          style={{ width: 32, height: 32 }}
          aria-label={t("graduation.loading")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background px-4 py-10">
      <Image
        src="/icons/graduation/graduation.svg"
        alt=""
        width={63}
        height={45}
        className="shrink-0"
        aria-hidden
      />
      <h1 className="mt-6 text-center text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
        {t("graduation.title")}
      </h1>
      <p className="mt-3 text-center text-ds-body-16-r leading-ds-body-16-r text-ds-tertiary">
        {t("graduation.subtitle1")}
        <br />
        {t("graduation.subtitle2")}
      </p>
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="mt-8 w-full max-w-[320px] text-white"
        onClick={handleStart}
      >
        {t("graduation.start")}
      </Button>
    </div>
  );
}
