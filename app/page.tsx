"use client";

import { useEffect, useState } from "react";
import { SplashScreen } from "@/components/splash-screen";

const SPLASH_STORAGE_KEY = "navi_splash_shown";
const SPLASH_DURATION_MS = 1500;

function hideSplash() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
  }
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  // 첫 방문이 아니면 스플래시 건너뜀
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SPLASH_STORAGE_KEY) === "1") {
      queueMicrotask(() => setShowSplash(false));
    }
  }, []);

  // 스플래시 표시 시간 후 View Transitions로 전환 (페이드아웃 별도 불필요)
  useEffect(() => {
    if (!showSplash) return;
    const t = setTimeout(() => {
      const doHide = () => {
        hideSplash();
        setShowSplash(false);
      };
      if (typeof document !== "undefined" && typeof document.startViewTransition === "function") {
        document.startViewTransition(doHide);
      } else {
        doHide();
      }
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [showSplash]);

  return (
    <>
      {showSplash && <SplashScreen />}
      <main className="min-h-screen bg-background p-4">
        {/* Figma 1136-9535: 메인 빈 영역 환영 문구, 한양대만 브랜드 색 */}
        <p className="text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
          회원님의 <span className="text-ds-brand">한양대</span> 생활을 더 편하게
        </p>
      </main>
    </>
  );
}
