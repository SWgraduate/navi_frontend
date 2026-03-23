"use client";

import { useCallback, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatLoading } from "@/components/chat/chat-loading";
import { useChat } from "@/contexts/chat-context";
import { useProfile } from "@/hooks/use-profile";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function Home() {
  const { t } = useTranslation();
  const { messages, isLoading } = useChat();
  const { profile } = useProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TODO: GET /auth/me 엔드포인트 추가 시 세션 만료 감지 후 /login 리다이렉트 복구

  // scrollIntoView 대신 스크롤 컨테이너(<main>)를 직접 조작 — 고정 높이 컨테이너에서 더 안정적
  const scrollToBottom = useCallback(() => {
    const mainEl = messagesEndRef.current?.closest("main") as HTMLElement | null;
    if (!mainEl) return;
    mainEl.scrollTop = mainEl.scrollHeight;
  }, []);

  // 메시지·로딩 상태가 바뀔 때마다 스크롤을 가장 아래로
  // 즉시 + 250ms 후 한 번 더 (mainHeight CSS transition 220ms 완료 후)
  useEffect(() => {
    if (messages.length === 0 && !isLoading) return;

    scrollToBottom();
    const id = setTimeout(scrollToBottom, 250);
    return () => clearTimeout(id);
  }, [messages, isLoading, scrollToBottom]);

  return (
    <div data-home-main-area className="bg-background p-4 pb-0">
      {messages.length === 0 ? (
        // 초기 상태: 환영 문구
        <p className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
          {t("home.welcomeName", { name: profile?.name ?? "" })}<br />
          <span className="text-ds-brand">{t("home.hanyangUniv")}</span>{t("home.welcomeSuffix")}
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
