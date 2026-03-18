"use client";

import { useEffect, useRef } from "react";
import { SplashScreen } from "@/components/splash-screen";
import { hasStoredLanguage } from "@/lib/i18n-storage";
import { useRouter } from "next/navigation";
import { withViewTransition } from "@/lib/view-transition";

/** 스플래시 최소 노출 시간 (UX: 너무 짧으면 어색함) */
const MIN_DWELL_MS = 1500;

/**
 * 언어 설정 여부 + (추후) 세션 유효성 검증을 기준으로 이동할 경로 결정.
 * TODO: GET /auth/me 엔드포인트 추가 시 세션 체크 후 /home 분기 복구
 *   if (await checkSession()) return "/home";
 */
function resolveDestination(): "/login" | "/language-onboarding" {
  // TODO: 세션 유효성 API 엔드포인트 준비되면 아래 주석 복구
  // if (isLoggedIn()) return "/home";
  if (!hasStoredLanguage()) return "/language-onboarding";
  return "/login";
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
