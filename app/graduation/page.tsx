"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { hasGraduationResult } from "@/lib/mock-accounts";
import { withViewTransition } from "@/lib/view-transition";

/** Figma 1212-11510: 졸업 관리 시작하기 화면 */
export default function GraduationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬스토리지 확인 후 라우팅 결정
    const checkAndRoute = () => {
      if (hasGraduationResult()) {
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
  }, [router]);

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
          aria-label="로딩 중"
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
        졸업관리, 스마트하게 시작해요
      </h1>
      <p className="mt-3 text-center text-ds-body-16-r leading-ds-body-16-r text-ds-tertiary">
        한양대 포털에서 졸업사정조회를 스크린샷하여
        <br />
        남은 과정을 한눈에 확인하세요.
      </p>
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="mt-8 w-full max-w-[320px] text-white"
        onClick={handleStart}
      >
        시작하기
      </Button>
    </div>
  );
}
