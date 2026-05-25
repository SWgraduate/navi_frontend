import { apiFetch } from "./client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * 채팅(Chat) 관련 API 모음입니다.
 *
 * - **어떤 화면/흐름에서 쓰나**
 *   - `contexts/chat-context.tsx`에서 사용자의 질문 전송 및 결과 폴링에 사용합니다.
 *   - `/chat` 호출로 `taskId`를 받고, `/chat/status/{taskId}`를 주기적으로 조회하는 비동기 모델입니다.
 */

// ============ POST /chat ============

/** POST /chat 요청 */
export type ChatRequest = {
  query: string;
  conversationId?: string;
  hasAttachments?: boolean;
};

/** POST /chat 성공 응답 (200) - 비동기 처리용 taskId 발급 */
export type ChatTaskResponse = {
  taskId: string;
  message: string;
  conversationId?: string;
};

/** 질문을 전송하고 비동기 작업(taskId)을 생성합니다. */
export async function sendChatQuery(payload: ChatRequest): Promise<ChatTaskResponse> {
  return apiFetch<ChatTaskResponse>("/chat", {
    method: "POST",
    body: payload,
  });
}

// ============ GET /chat/status/{taskId} ============

/** GET /chat/status/{taskId} 응답 */
export type ChatStatusResponse = {
  taskId?: string;
  status?: "queued" | "processing" | "completed" | "failed";
  progress?: string;
  displayMessage?: string;
  result?:
    | {
        answer?: string;
        sources?: unknown[];
        retrievalMeta?: unknown;
        /** 메뉴 관련 질문일 때만 포함되는 한양대 서버의 메뉴 이미지 절대경로 배열 */
        menuImages?: string[];
      }
    | string;
  error?: string;
};

/** taskId의 처리 상태/결과를 조회합니다(폴링용). */
export async function getChatStatus(taskId: string): Promise<ChatStatusResponse> {
  return apiFetch<ChatStatusResponse>(`/chat/status/${encodeURIComponent(taskId)}`, {
    method: "GET",
  });
}

// ============ POST /chat/conversations ============

export type CreateConversationResponse = {
  conversationId: string;
};

export async function createConversation(title?: string): Promise<CreateConversationResponse> {
  return apiFetch<CreateConversationResponse>("/chat/conversations", {
    method: "POST",
    body: title ? { title } : {},
  });
}

// ============ POST /chat/context/uploads ============

export type UploadChatFileResponse = {
  documentId: string;
};

export async function uploadChatFile(file: File): Promise<UploadChatFileResponse> {
  const url = `${API_BASE}/chat/context/uploads`.replace(/([^:]\/)\/+/g, "$1");
  const token = typeof window !== "undefined" ? localStorage.getItem("navi_access_token") : null;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("파일 업로드에 실패했습니다.");
  }
  return res.json() as Promise<UploadChatFileResponse>;
}

// ============ POST /chat/context/bindings ============

export async function bindDocument(conversationId: string, documentId: string): Promise<void> {
  return apiFetch<void>("/chat/context/bindings", {
    method: "POST",
    body: { conversationId, documentId },
  });
}

// ============ GET /chat/conversations ============

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  pinned: boolean;
};

export type ListConversationsResponse = {
  conversations: Conversation[];
};

export async function listConversations(searchQuery?: string): Promise<ListConversationsResponse> {
  const params = searchQuery ? `?searchQuery=${encodeURIComponent(searchQuery)}` : "";
  return apiFetch<ListConversationsResponse>(`/chat/conversations${params}`, { method: "GET" });
}

// ============ DELETE /chat/conversations/{id} ============

export async function deleteConversation(conversationId: string): Promise<void> {
  return apiFetch<void>(`/chat/conversations/${encodeURIComponent(conversationId)}`, {
    method: "DELETE",
  });
}

// ============ PATCH /chat/conversations/{id}/pin ============

export async function pinConversation(conversationId: string, pinned: boolean): Promise<void> {
  return apiFetch<void>(`/chat/conversations/${encodeURIComponent(conversationId)}/pin`, {
    method: "PATCH",
    body: { pinned },
  });
}

// ============ PATCH /chat/conversations/{id}/title ============

export async function renameConversation(conversationId: string, title: string): Promise<void> {
  return apiFetch<void>(`/chat/conversations/${encodeURIComponent(conversationId)}/title`, {
    method: "PATCH",
    body: { title },
  });
}

// ============ GET /chat/conversations/{id}/messages ============

// 백엔드가 query/answer 쌍 또는 content/role 개별 형식으로 반환할 수 있음
export type ConversationMessage = {
  id?: string;
  // query/answer 쌍 형식
  query?: string;
  answer?: string;
  // content/role 개별 형식
  content?: string;
  role?: "user" | "assistant";
  createdAt?: string;
};

export type GetConversationMessagesResponse = {
  messages: ConversationMessage[];
};

export async function getConversationMessages(conversationId: string): Promise<GetConversationMessagesResponse> {
  return apiFetch<GetConversationMessagesResponse>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    { method: "GET" }
  );
}

// ============ POST /chat/{chatId}/voice-session ============

/** POST /chat/{chatId}/voice-session 응답 */
export type VoiceSessionResponse = {
  /** 1회성 세션 인증 토큰 (60초 이내 WebSocket 연결에 사용) */
  token: string;
  /** WebSocket 연결 경로 (토큰 포함) */
  wsUrl: string;
};

/** 실시간 음성 대화를 위한 일회성 WebSocket 세션 토큰을 발급합니다. */
export async function createVoiceSession(chatId: string): Promise<VoiceSessionResponse> {
  return apiFetch<VoiceSessionResponse>(`/chat/${encodeURIComponent(chatId)}/voice-session`, {
    method: "POST",
  });
}
