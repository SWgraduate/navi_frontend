"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useHeaderBackground } from "@/hooks/use-header-background";

/** Figma 1212-11608: 졸업사정조회 이미지 인식 중 페이지 */
export default function GraduationProcessingPage() {
  useHeaderBackground("white");
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("image");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 진행률 애니메이션 시뮬레이션
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // TODO: 완료 후 결과 페이지로 이동
          // setTimeout(() => {
          //   withViewTransition(() => router.push("/graduation/result"));
          // }, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 50ms마다 1% 증가 (총 5초)

    return () => clearInterval(interval);
  }, [router]);

  if (!imageUrl) {
    // 이미지가 없으면 업로드 페이지로 리다이렉트
    router.replace("/graduation/upload");
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* 검은 배경 영역 - 업로드된 이미지 */}
      <div className="relative overflow-hidden bg-black" style={{ height: "65vh", minHeight: "400px" }}>
        {/* 업로드된 이미지 */}
        <div className="relative z-0 flex h-full w-full items-center justify-center p-4">
          <div className="relative w-full max-w-sm">
            <Image
              src={imageUrl}
              alt="졸업사정조회 스크린샷"
              width={800}
              height={1200}
              className="w-full h-auto max-h-[1200px] object-contain"
            />
          </div>
        </div>
        
        {/* 파란색 그라디언트 애니메이션 - 이미지 위에 오버레이 */}
        <div
          className="absolute inset-0 z-10 animate-gradient-move pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(6, 107, 249, 0) 0%,
              rgba(6, 107, 249, 0.4) 30%,
              rgba(6, 107, 249, 0.7) 50%,
              rgba(6, 107, 249, 0.4) 70%,
              rgba(6, 107, 249, 0) 100%)`,
            height: "200%",
            width: "100%",
            opacity: 0.5,
          }}
        />
      </div>

      {/* 하단 진행률 표시 */}
      <div className="shrink-0 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-20">
        <div className="flex items-center justify-center gap-2">
          <span className="text-ds-body-16-r leading-ds-body-16-r font-semibold text-ds-brand">
            {progress}%
          </span>
          <span className="text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
            이미지 인식중...
          </span>
        </div>
      </div>

    </div>
  );
}
