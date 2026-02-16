/**
 * 로그인 목데이터 (개발용).
 * API 연동 시 제거하고 실제 인증으로 교체.
 */

export const MOCK_LOGIN_ACCOUNT = {
  /** 사용자 이름 */
  name: "Navi",
  /** 이메일 (한양대 도메인) */
  email: "aaaaaaaa@hanyang.ac.kr",
  /** 비밀번호 */
  password: "1234",
} as const;

/** 목데이터와 일치하는지 검사 (이메일·비밀번호) */
export function matchMockAccount(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === MOCK_LOGIN_ACCOUNT.email.toLowerCase() &&
    password === MOCK_LOGIN_ACCOUNT.password
  );
}
