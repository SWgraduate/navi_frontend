/**
 * 앱 전역에서 사용하는 HTTP 클라이언트 래퍼입니다.
 *
 * - **어떨 때 쓰나**: `lib/api/*`의 대부분(JSON body) 요청에서 공통으로 사용합니다.
 * - **인증 방식**: JWT 기반. localStorage(`navi_access_token`)의 accessToken을 `Authorization: Bearer` 헤더로 전송합니다.
 * - **환경 변수**: `NEXT_PUBLIC_API_URL`에 백엔드 API 베이스 URL을 넣습니다.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ApiError = {
  error: string;
};

type ApiFetchOptions = Omit<RequestInit, "body"> & { body?: object };

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, ...init } = options;
  const url = `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, "$1");

  const token = typeof window !== "undefined" ? localStorage.getItem("navi_access_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init.headers,
  };

  const res = await fetch(url, {
    ...init,
    credentials: init.credentials ?? "include",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as T | ApiError;

  if (!res.ok) {
    const err = (data as ApiError).error ?? res.statusText ?? "요청에 실패했습니다.";
    throw new Error(typeof err === "string" ? err : JSON.stringify(err));
  }

  return data as T;
}
