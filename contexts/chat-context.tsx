"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // TODO: API 호출 예정. 현재는 2초 로딩 후 목데이터 답변
    const LOADING_MS = 2000;
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "답변을 확인했습니다",
        isUser: false,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, LOADING_MS);
  };

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage }}>
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
