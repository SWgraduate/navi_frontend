"use client";

import { useEffect, useState } from "react";
import { SplashScreen } from "@/components/splash-screen";

const SPLASH_DURATION_MS = 1500;
const FADEOUT_DURATION_MS = 400;

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  useEffect(() => {
    const startExit = setTimeout(() => setSplashExiting(true), SPLASH_DURATION_MS);
    return () => clearTimeout(startExit);
  }, []);

  useEffect(() => {
    if (!splashExiting) return;
    const unmount = setTimeout(() => setShowSplash(false), FADEOUT_DURATION_MS);
    return () => clearTimeout(unmount);
  }, [splashExiting]);

  return (
    <>
      {showSplash && <SplashScreen exiting={splashExiting} />}
      <main className="min-h-screen bg-background">
        {/* 페이지 콘텐츠 */}
      </main>
    </>
  );
}
