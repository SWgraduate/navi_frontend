"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Figma 1026-2964: 흰 배경, 중앙 파란 로고만. exiting 시 페이드 아웃 */
export function SplashScreen({
  className,
  exiting,
}: {
  className?: string;
  exiting?: boolean;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-100 flex min-h-dvh items-center justify-center bg-white transition-opacity duration-300 ease-out",
        exiting && "opacity-0",
        className
      )}
      aria-label="Navi 로딩"
    >
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
  );
}
