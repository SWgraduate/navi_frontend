import { apiFetch } from "./client";

// ============ Auth 공통 응답 ============

/** Auth API 공통 성공 응답 */
export type AuthResponse = {
  token?: string;
  message?: string;
  user?: { id?: string; email?: string; name?: string; [key: string]: unknown };
  [key: string]: unknown;
};

// ============ POST /auth/register ============

/** POST /auth/register 요청 */
export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  studentId?: string;
  major?: string;
  secondMajor?: string;
  academicStatus?: string;
  yearSemester?: string;
  [key: string]: unknown;
};

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

// ============ POST /auth/login ============

/** POST /auth/login 요청 */
export type LoginRequest = {
  email: string;
  password: string;
};

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

// ============ POST /auth/logout ============

export async function logout(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/logout", {
    method: "POST",
  });
}

// ============ DELETE /auth/leave ============

export async function leave(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/leave", {
    method: "DELETE",
  });
}

// ============ POST /auth/email/send ============

/** POST /auth/email/send 요청 */
export type SendEmailRequest = {
  email: string;
};

/** POST /auth/email/send 성공 응답 (200) */
export type SendEmailResponse = {
  message: string;
};

export async function sendAuthEmail(payload: SendEmailRequest): Promise<SendEmailResponse> {
  return apiFetch<SendEmailResponse>("/auth/email/send", {
    method: "POST",
    body: payload,
  });
}

// ============ POST /auth/email/verify ============

/** POST /auth/email/verify 요청 */
export type VerifyEmailRequest = {
  email: string;
  code: string;
};

/** POST /auth/email/verify 성공 응답 */
export type VerifyEmailResponse = {
  message?: string;
  [key: string]: unknown;
};

export async function verifyAuthEmail(
  payload: VerifyEmailRequest
): Promise<VerifyEmailResponse> {
  return apiFetch<VerifyEmailResponse>("/auth/email/verify", {
    method: "POST",
    body: payload,
  });
}
