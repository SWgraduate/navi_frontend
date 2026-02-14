"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Figma 1026-2964: 모바일(430px)만 흰 배경, 그 밖은 body(app-outer-bg). 중앙 파란 로고만. */
export function SplashScreen({ className }: { className?: string }) {
  return (
    <div
      className={cn("fixed inset-0 z-100 flex min-h-dvh justify-center", className)}
      aria-label="Navi 로딩"
    >
      <div className="flex min-h-full w-full max-w-[var(--app-max-width)] items-center justify-center bg-white">
        <div className="-translate-y-24 shrink-0">
          <Image
            src="/icons/Navi-icon%203.svg"
            alt="Navi"
            width={64}
            height={64}
            priority
          />
        </div>
      </div>
    </div>
  );
}
