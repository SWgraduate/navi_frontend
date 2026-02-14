"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ScrollFadeAxis = "x" | "y" | "both";

interface ScrollFadeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 페이드 방향: 가로 스크롤만, 세로만, 둘 다 */
  axis?: ScrollFadeAxis;
  /** 페이드 그라데이션 너비(px). 기본 24 */
  fadeSize?: number;
  /** 스크롤 영역 배경색(페이드와 맞출 색). 기본 design system surface */
  fadeColor?: string;
  children: React.ReactNode;
}

/**
 * 08 Scroll Fade – 스크롤 가능한 영역 끝에서 콘텐츠가 자연스럽게 사라지도록 페이드 처리.
 * 가로/세로 스크롤 리스트, 긴 텍스트 미리보기 등에 쓸 수 있음.
 */
const ScrollFade = React.forwardRef<HTMLDivElement, ScrollFadeProps>(
  (
    {
      className,
      axis = "both",
      fadeSize = 24,
      fadeColor = "var(--ds-gray-5)",
      children,
      style,
      ...props
    },
    ref
  ) => {
    const gradientStyle = (direction: "left" | "right" | "top" | "bottom") => {
      const transparent = "transparent";
      const color = fadeColor;
      const size = `${fadeSize}px`;
      const maps = {
        left: `linear-gradient(to right, ${color}, ${transparent})`,
        right: `linear-gradient(to left, ${color}, ${transparent})`,
        top: `linear-gradient(to bottom, ${color}, ${transparent})`,
        bottom: `linear-gradient(to top, ${color}, ${transparent})`,
      };
      return maps[direction];
    };

    const showLeft = axis === "x" || axis === "both";
    const showRight = axis === "x" || axis === "both";
    const showTop = axis === "y" || axis === "both";
    const showBottom = axis === "y" || axis === "both";

    return (
      <div
        ref={ref}
        className={cn("relative overflow-auto", className)}
        style={style}
        {...props}
      >
        {children}
        {/* 엣지 페이드 오버레이 – 터치/스크롤은 통과 */}
        {showLeft && (
          <div
            className="pointer-events-none absolute left-0 top-0 z-1 h-full"
            style={{
              width: fadeSize,
              background: gradientStyle("left"),
            }}
            aria-hidden
          />
        )}
        {showRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 z-1 h-full"
            style={{
              width: fadeSize,
              background: gradientStyle("right"),
            }}
            aria-hidden
          />
        )}
        {showTop && (
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-1"
            style={{
              height: fadeSize,
              background: gradientStyle("top"),
            }}
            aria-hidden
          />
        )}
        {showBottom && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-1"
            style={{
              height: fadeSize,
              background: gradientStyle("bottom"),
            }}
            aria-hidden
          />
        )}
      </div>
    );
  }
);
ScrollFade.displayName = "ScrollFade";

export { ScrollFade, type ScrollFadeProps, type ScrollFadeAxis };
