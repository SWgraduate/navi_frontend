"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/splash-screen";
import { withViewTransition } from "@/lib/view-transition";

/** 스플래시 1.5초 후 / 로 이동 */
export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      withViewTransition(() => router.replace("/"));
    }, 2500);
    return () => clearTimeout(t);
  }, [router]);

  return <SplashScreen />;
}
