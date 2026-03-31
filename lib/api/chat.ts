import { apiFetch } from "./client";

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
};

/** POST /chat 성공 응답 (200) - 비동기 처리용 taskId 발급 */
export type ChatTaskResponse = {
  taskId: string;
  message: string;
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
  status?: string;
  progress?: string;
  displayMessage?: string;
  result?: {
    answer?: string;
    sources?: unknown[];
    retrievalMeta?: unknown;
  };
};

/** taskId의 처리 상태/결과를 조회합니다(폴링용). */
export async function getChatStatus(taskId: string): Promise<ChatStatusResponse> {
  return apiFetch<ChatStatusResponse>(`/chat/status/${encodeURIComponent(taskId)}`, {
    method: "GET",
  });
}
