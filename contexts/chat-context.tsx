"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { sendChatQuery, getChatStatus } from "@/lib/api/chat";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => void;
  /** 새 채팅 시작 (메시지 초기화 후 메인으로 이동할 때 사용) */
  startNewChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 60;

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { taskId } = await sendChatQuery({ query: text.trim() });

      // 비동기 처리: taskId로 상태 폴링
      let attempts = 0;
      const poll = async () => {
        if (attempts >= MAX_POLL_ATTEMPTS) {
          setMessages((prev) => [
            ...prev,
            { id: `err-${Date.now()}`, text: "응답 대기 시간이 초과되었습니다.", isUser: false },
          ]);
          setIsLoading(false);
          return;
        }
        attempts += 1;

        const status = await getChatStatus(taskId);
        const answer =
          status.message ?? status.result ?? (status as { answer?: string }).answer ?? "";

        if (answer.trim()) {
          const assistantMessage: Message = {
            id: `assistant-${taskId}`,
            text: answer.trim(),
            isUser: false,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        }

        // completed/done 상태이지만 메시지가 없는 경우
        const done = status.status === "completed" || status.status === "done";
        if (done) {
          setMessages((prev) => [
            ...prev,
            { id: `assistant-${taskId}`, text: "처리가 완료되었습니다.", isUser: false },
          ]);
          setIsLoading(false);
          return;
        }

        setTimeout(poll, POLL_INTERVAL_MS);
      };

      await poll();
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "채팅 요청에 실패했습니다.";
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, text: errorText, isUser: false },
      ]);
      setIsLoading(false);
    }
  }, []);

  const startNewChat = () => {
    setMessages([]);
    setIsLoading(false);
  };

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage, startNewChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
