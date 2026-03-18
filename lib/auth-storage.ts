/**
 * 로그인 여부 저장/조회 (스플래시 분기, 로그인 페이지 연동용).
 * 로그인 성공 시 setLoggedIn(true) 호출. 실제 API 연동 시 토큰 검증 등으로 교체 가능.
 */

const AUTH_STORAGE_KEY = "navi_logged_in";
const EMAIL_STORAGE_KEY = "navi_email";

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
  }
}

export function saveEmail(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(EMAIL_STORAGE_KEY, email);
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_STORAGE_KEY);
}
