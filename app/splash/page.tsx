"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/splash-screen";
import { isLoggedIn } from "@/lib/auth-storage";
import { withViewTransition } from "@/lib/view-transition";

const SPLASH_DURATION_MS = 2500;

/** 스플래시 후 로그인 여부에 따라 메인(/) 또는 로그인(/login)으로 이동 */
export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      const destination = isLoggedIn() ? "/" : "/login";
      withViewTransition(() => router.replace(destination));
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [router]);

  return <SplashScreen />;
}
