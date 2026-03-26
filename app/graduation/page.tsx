"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { withViewTransition } from "@/lib/view-transition";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const SKIP_SAVED_RESULT_KEY = "navi_skip_saved_graduation_result_once";

function GraduationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const skipSavedResult = searchParams.get("skipSavedResult") === "1";

  // lazy initializer: 렌더 시점에 sessionStorage 확인 후 초기 로딩 상태 결정
  const [shouldRedirectToResult] = useState(() => {
    if (skipSavedResult) return false;
    if (typeof window !== "undefined" && sessionStorage.getItem(SKIP_SAVED_RESULT_KEY) === "1") {
      sessionStorage.removeItem(SKIP_SAVED_RESULT_KEY);
      return false;
    }
    return true;
  });

  const isLoading = shouldRedirectToResult;
  const hasRun = useRef(false);

  useEffect(() => {
    if (!shouldRedirectToResult) return;
    if (hasRun.current) return;
    hasRun.current = true;

    // result 페이지에서 API 호출 + 데이터 없으면 다시 돌아오므로 바로 리다이렉트
    withViewTransition(() => router.push("/graduation/result"));
  }, [router, shouldRedirectToResult]);

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

/** Figma 1212-11510: 졸업 관리 시작하기 화면 */
export default function GraduationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-background">
          <div
            className="rounded-full bg-ds-gray-30 animate-pulse-scale"
            style={{ width: 32, height: 32 }}
            aria-label="Loading"
          />
        </div>
      }
    >
      <GraduationContent />
    </Suspense>
  );
}
