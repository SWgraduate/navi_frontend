"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

/** Figma 1212-11061: 졸업 관리 인트로. 아이콘 + 타이틀 + 설명 + 시작 버튼 */
export default function GraduationPage() {
  const handleStart = () => {
    // TODO: 졸업 관리 플로우 시작 (스크린샷 업로드 등)
  };

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-10">
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
        시작
      </Button>
    </main>
  );
}
