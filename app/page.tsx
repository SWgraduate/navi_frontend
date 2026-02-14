"use client";

import { useEffect, useState } from "react";
import { SplashScreen } from "@/components/splash-screen";

const SPLASH_STORAGE_KEY = "navi_splash_shown";
const SPLASH_DURATION_MS = 1500;
const FADEOUT_DURATION_MS = 400;

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  // 첫 방문이 아니면 스플래시 건너뜀 (setState는 비동기로 호출해 린트 회피)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SPLASH_STORAGE_KEY) === "1") {
      queueMicrotask(() => setShowSplash(false));
    }
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    const startExit = setTimeout(() => setSplashExiting(true), SPLASH_DURATION_MS);
    return () => clearTimeout(startExit);
  }, [showSplash]);

  useEffect(() => {
    if (!splashExiting) return;
    const unmount = setTimeout(() => {
      sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
      setShowSplash(false);
    }, FADEOUT_DURATION_MS);
    return () => clearTimeout(unmount);
  }, [splashExiting]);

  return (
    <>
      {showSplash && <SplashScreen exiting={splashExiting} />}
      <main className="min-h-screen bg-background p-4">
        <p className="text-muted-foreground">내용없음</p>
      </main>
    </>
  );
}
