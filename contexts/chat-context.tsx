"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  sendChatQuery,
  getChatStatus,
  createConversation,
  uploadChatFile,
  bindDocument,
} from "@/lib/api/chat";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string, attachments?: File[]) => void;
  /** 새 채팅 시작 (메시지 초기화 후 메인으로 이동할 때 사용) */
  startNewChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 60;

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string, attachments: File[] = []) => {
      if (!text.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        isUser: true,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        let activeConversationId = conversationId;

        if (attachments.length > 0) {
          // conversationId 없으면 새 대화 생성
          if (!activeConversationId) {
            const conv = await createConversation();
            activeConversationId = conv.id;
            setConversationId(conv.id);
          }

          // 파일 업로드 → 바인딩 (순차 처리)
          for (const file of attachments) {
            const { documentId } = await uploadChatFile(file);
            await bindDocument(activeConversationId, documentId);
          }
        }

        const { taskId, conversationId: returnedConvId } = await sendChatQuery({
          query: text.trim(),
          ...(activeConversationId ? { conversationId: activeConversationId } : {}),
          ...(attachments.length > 0 ? { hasAttachments: true } : {}),
        });

        // 서버가 반환한 conversationId 저장
        if (returnedConvId && !activeConversationId) {
          setConversationId(returnedConvId);
        }

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
          const isDone = status.progress === "done" || status.status === "completed";
          if (isDone) {
            const answer = status.result?.answer?.trim() ?? "";
            setMessages((prev) => [
              ...prev,
              {
                id: `assistant-${taskId}`,
                text: answer || "처리가 완료되었습니다.",
                isUser: false,
              },
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
    },
    [conversationId]
  );

  const startNewChat = () => {
    setMessages([]);
    setIsLoading(false);
    setConversationId(null);
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
