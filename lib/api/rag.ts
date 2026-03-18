import type { ApiError } from "./client";

export type IngestionStatus = "pending" | "processing" | "processed" | "failed";

export type IngestPdfResult = {
  documentId: string;
  status: IngestionStatus;
  message: string;
  isDuplicate: boolean;
  chunkCount: number;
};

export type UploadPdfRequest = {
  file: File;
  userId: string;
  role?: string;
};

/**
 * POST /rag/documents/upload
 * - multipart/form-data
 * - 성공 시 IngestPdfResult 반환 (스웨거 기준 200/201 가능)
 */
export async function uploadRagPdf(payload: UploadPdfRequest): Promise<IngestPdfResult> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
  const url = `${API_BASE}/rag/documents/upload`.replace(/([^:]\/)\/+/g, "$1");

  const form = new FormData();
  form.append("file", payload.file);
  form.append("userId", payload.userId);
  if (payload.role) form.append("role", payload.role);

  const res = await fetch(url, {
    method: "POST",
    body: form,
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as IngestPdfResult | ApiError;
  if (!res.ok) {
    const err = (data as ApiError).error ?? res.statusText ?? "요청에 실패했습니다.";
    throw new Error(typeof err === "string" ? err : JSON.stringify(err));
  }

  return data as IngestPdfResult;
}

