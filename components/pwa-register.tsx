"use client";

import { useEffect } from "react";

const SW_PATH = "/sw.js";

/**
 * PWA 설치 배너 노출을 위해 서비스 워커 등록.
 * layout에서 한 번만 마운트되면 됨.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register(SW_PATH, { scope: "/" })
      .then((reg) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[PWA] Service Worker 등록:", reg.scope);
        }
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker 등록 실패:", err);
      });
  }, []);

  return null;
}
