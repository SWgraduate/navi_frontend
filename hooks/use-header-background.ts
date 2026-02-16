"use client";

import { useEffect } from "react";

const HEADER_BG_VAR = "--header-bg";

/**
 * 페이지 배경색에 맞춰 헤더(및 main) 배경색을 설정합니다.
 * 언마운트 시 CSS 변수를 제거해 기본값으로 복원합니다.
 * @param color - CSS 색상 값 (예: "white", "#ffffff", "var(--background)")
 */
export function useHeaderBackground(color: string) {
  useEffect(() => {
    document.documentElement.style.setProperty(HEADER_BG_VAR, color);
    return () => {
      document.documentElement.style.removeProperty(HEADER_BG_VAR);
    };
  }, [color]);
}
