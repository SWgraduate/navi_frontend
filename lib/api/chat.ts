import { apiFetch } from "./client";

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
  message?: string;
  result?: string;
  [key: string]: unknown;
};

export async function getChatStatus(taskId: string): Promise<ChatStatusResponse> {
  return apiFetch<ChatStatusResponse>(`/chat/status/${encodeURIComponent(taskId)}`, {
    method: "GET",
  });
}
