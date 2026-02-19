/**
 * 목데이터 (개발용).
 * API 연동 시 제거하고 실제 데이터로 교체.
 */

// ===== 로그인 목데이터 =====

export const MOCK_LOGIN_ACCOUNT = {
  /** 사용자 이름 */
  name: "Navi",
  /** 이메일 (한양대 도메인) */
  email: "aaaaaaaa@hanyang.ac.kr",
  /** 비밀번호 (스키마: 8자 이상, 한글 불가) */
  password: "Qwer1234!",
} as const;

/** 목데이터와 일치하는지 검사 (이메일·비밀번호) */
export function matchMockAccount(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === MOCK_LOGIN_ACCOUNT.email.toLowerCase() &&
    password === MOCK_LOGIN_ACCOUNT.password
  );
}

// ===== 졸업사정조회 목데이터 =====

export const CREDIT_KEYS = [
  "enrollment",
  "graduation",
  "major",
  "coreMajor",
  "advancedMajor",
  "industryCooperation",
  "generalElective",
  "secondMajor",
  "secondCoreMajor",
  "secondPrerequisite",
  "secondUncompleted",
  "prerequisite",
  "uncompleted",
  "thesis",
  "englishOnly",
  "graduationGpa",
  "socialService",
  "pbl",
  "majorIcPbl",
  "microMajor",
] as const;

export type CreditKey = (typeof CREDIT_KEYS)[number];

export type Credits = Record<CreditKey, string>;

export const MAJOR_TYPE = {
  BASIC: "BASIC",
  DOUBLE: "DOUBLE",
  MICRO: "MICRO",
} as const;

export type MajorType = (typeof MAJOR_TYPE)[keyof typeof MAJOR_TYPE];

export interface GraduationResultData {
  type: MajorType;
  credits: Credits;
}

/** Navi 사용자의 기본 졸업사정조회 취득 데이터 */
export const MOCK_NAVI_GRADUATION_DATA: GraduationResultData = {
  type: MAJOR_TYPE.DOUBLE,
  credits: {
    enrollment: "",
    graduation: "104(36)",
    major: "37",
    coreMajor: "33",
    advancedMajor: "3",
    industryCooperation: "5(1)",
    generalElective: "26",
    secondMajor: "21",
    secondCoreMajor: "11",
    secondPrerequisite: "Y",
    secondUncompleted: "Y",
    prerequisite: "Y",
    uncompleted: "Y",
    thesis: "Y",
    englishOnly: "1(1)",
    graduationGpa: "4.16",
    socialService: "5",
    pbl: "7",
    majorIcPbl: "5",
    microMajor: "",
  },
};

// ===== 졸업사정조회 스토어 (로컬스토리지 저장) =====

const GRADUATION_STORAGE_KEY = "navi_graduation_result";

/** 졸업사정조회 결과 조회 */
export function getGraduationResult(): GraduationResultData | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(GRADUATION_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as GraduationResultData;
  } catch {
    return null;
  }
}

/** 졸업사정조회 결과 저장 */
export function setGraduationResult(data: GraduationResultData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GRADUATION_STORAGE_KEY, JSON.stringify(data));
}

/** 졸업사정조회 결과 초기화 (로컬스토리지에서 삭제) */
export function clearGraduationResult(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GRADUATION_STORAGE_KEY);
}

/** 졸업사정조회 결과 존재 여부 확인 */
export function hasGraduationResult(): boolean {
  return getGraduationResult() !== null;
}

/** 기본 취득 데이터 조회 */
export function getDefaultCredits(): Credits {
  return { ...MOCK_NAVI_GRADUATION_DATA.credits };
}
