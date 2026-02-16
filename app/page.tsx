"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/splash-screen";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatLoading } from "@/components/chat/chat-loading";
import { useChat } from "@/contexts/chat-context";
import { isLoggedIn } from "@/lib/auth-storage";

const SPLASH_STORAGE_KEY = "navi_splash_shown";
const SPLASH_DURATION_MS = 1500;

/* 목데이터 – API 연동 시 제거 후 실제 데이터로 교체 */
const MOCK_MAIN_USER = { name: "Navi" } as const;

function hideSplash() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
  }
}

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 비로그인 시 로그인 페이지로 (메인 직접 진입 시)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
  }, [router]);

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

  // 메시지·로딩 상태가 바뀔 때마다 스크롤을 가장 아래로
  useEffect(() => {
    if (messages.length === 0 && !isLoading) return;
    
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  return (
    <>
      {showSplash && <SplashScreen />}
      <div data-home-main-area className="bg-background p-4 pb-0">
        {messages.length === 0 ? (
          // 초기 상태: 환영 문구
          <p className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            {MOCK_MAIN_USER.name}님의 <br/>
            <span className="text-ds-brand">한양대</span> 생활을 더 편하게
          </p>
        ) : (
          // 채팅 메시지 목록
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isUser={message.isUser}
              />
            ))}
            {isLoading && <ChatLoading />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </>
  );
}
