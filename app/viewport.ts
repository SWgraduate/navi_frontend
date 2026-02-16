import type { Viewport } from "next";

/**
 * 모바일 우선 뷰포트.
 * - width=device-width: 기기 너비에 맞춤
 * - initialScale=1: 축소 없음 (모바일 퍼스트 레이아웃 가정)
 * - viewportFit=cover: 노치/세이프에리어 대응 (PWA 풀스크린 시)
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  interactiveWidget: "resizes-visual", // 키보드 등 인터랙티브 위젯에 대한 뷰포트 리사이즈 동작 설정
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#066bf9" },
    { media: "(prefers-color-scheme: dark)", color: "#066bf9" },
  ],
  viewportFit: "cover",
};
