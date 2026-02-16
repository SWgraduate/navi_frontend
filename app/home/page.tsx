"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatLoading } from "@/components/chat/chat-loading";
import { useChat } from "@/contexts/chat-context";
import { isLoggedIn } from "@/lib/auth-storage";

/* 목데이터 – API 연동 시 제거 후 실제 데이터로 교체 */
const MOCK_MAIN_USER = { name: "Navi" } as const;

export default function Home() {
  const router = useRouter();
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 비로그인 시 스플래시(/)로 보냄 → 스플래시에서 1.5초 후 /login으로 라우팅
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLoggedIn()) {
      router.replace("/");
      return;
    }
  }, [router]);

  // 메시지·로딩 상태가 바뀔 때마다 스크롤을 가장 아래로
  useEffect(() => {
    if (messages.length === 0 && !isLoading) return;

    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  return (
    <div data-home-main-area className="bg-background p-4 pb-0">
      {messages.length === 0 ? (
        // 초기 상태: 환영 문구
        <p className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
          {MOCK_MAIN_USER.name}님의 <br />
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
  );
}
