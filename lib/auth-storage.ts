/**
 * 로그인 여부 저장/조회 (스플래시 분기, 로그인 페이지 연동용).
 * 로그인 성공 시 setLoggedIn(true) 호출. 실제 API 연동 시 토큰 검증 등으로 교체 가능.
 */

const AUTH_STORAGE_KEY = "navi_logged_in";
const EMAIL_STORAGE_KEY = "navi_email";
const ACCESS_TOKEN_KEY = "navi_access_token";
const USER_ID_KEY = "navi_user_id";
const USER_ROLE_KEY = "navi_user_role";

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === "1";
}

export function setLoggedIn(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(AUTH_STORAGE_KEY, "1");
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(EMAIL_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
  }
}

export function saveAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveUserInfo(id: string, role: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_ID_KEY, id);
  localStorage.setItem(USER_ROLE_KEY, role);
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ROLE_KEY);
}

export function saveEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(EMAIL_STORAGE_KEY, email);
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_STORAGE_KEY);
}
