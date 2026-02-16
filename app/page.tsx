"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/splash-screen";
import { isLoggedIn } from "@/lib/auth-storage";
import { withViewTransition } from "@/lib/view-transition";

/** 스플래시 최소 노출 시간 (UX: 너무 짧으면 어색함) */
const MIN_DWELL_MS = 1500;

/**
 * 로그인 여부를 기준으로 이동할 경로 결정.
 * 스플래시를 벗어날 시점에 한 번만 호출해 최신 상태로 보낸다.
 */
function resolveDestination(): "/home" | "/login" {
  return isLoggedIn() ? "/home" : "/login";
}

/** / = 스플래시. 1.5초 후 로그인 여부에 따라 /home 또는 /login으로 이동 */
export default function SplashPage() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      const destination = resolveDestination();

      withViewTransition(async () => {
        router.replace(destination);
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });
      });
    }, MIN_DWELL_MS);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return <SplashScreen />;
}
