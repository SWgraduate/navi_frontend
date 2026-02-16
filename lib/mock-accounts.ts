/**
 * 로그인 목데이터 (개발용).
 * API 연동 시 제거하고 실제 인증으로 교체.
 *
 * 참고: 로그인 폼 Zod 스키마(lib/schemas/login.ts)를 변경하면
 * 여기 값이 스키마를 통과하는지 확인하고, 필요 시 수정.
 */
export const MOCK_LOGIN_ACCOUNT = {
  /** 사용자 이름 */
  name: "Navi",
  /** 이메일 (한양대 도메인) */
  email: "aaaaaaaa@hanyang.ac.kr",
  /** 비밀번호 (스키마: 8자 이상, 한글 불가) */
  password: "qwer1234",
} as const;

/** 목데이터와 일치하는지 검사 (이메일·비밀번호) */
export function matchMockAccount(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === MOCK_LOGIN_ACCOUNT.email.toLowerCase() &&
    password === MOCK_LOGIN_ACCOUNT.password
  );
}
