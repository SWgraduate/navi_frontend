import { apiFetch } from "./client";

/**
 * 인증(Auth) 관련 API 모음입니다.
 *
 * - **어떤 화면에서 쓰나**
 *   - 회원가입 플로우: `app/signup/email`, `app/signup/verify`에서 이메일 인증 발송/검증에 사용
 *   - (추후) 로그인/회원가입 완료 처리에서 `login`, `register`, `logout`, `leave` 연결에 사용
 *
 * - **주의**: 현재 로그인 화면(`app/login`)은 목데이터를 사용 중이어서, 이 파일이 “존재”하더라도
 *   화면에서 자동으로 호출되지는 않습니다(연결은 별도 작업).
 */

// ============ Auth 공통 응답 ============

/** Auth API 공통 성공 응답 */
export type AuthResponse = {
  token?: string;
  message?: string;
  user?: { id?: string; email?: string; name?: string; [key: string]: unknown };
  [key: string]: unknown;
};

/** POST /auth/login 성공 응답 */
export type LoginResponse = {
  user: {
    role: string;
    email: string;
    id: string;
  };
  accessToken: string;
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

/** 회원가입 (이메일 인증 완료 후 호출) */
export async function register(payload: RegisterRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/register", {
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

/** 로그인 */
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

// ============ POST /auth/logout ============

/** 로그아웃 */
export async function logout(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/logout", {
    method: "POST",
  });
}

// ============ DELETE /auth/leave ============

/** 회원 탈퇴 */
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

/** 회원가입용 이메일 인증번호 발송 */
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

/** 회원가입용 이메일 인증번호 검증 */
export async function verifyAuthEmail(
  payload: VerifyEmailRequest
): Promise<VerifyEmailResponse> {
  return apiFetch<VerifyEmailResponse>("/auth/email/verify", {
    method: "POST",
    body: payload,
  });
}
