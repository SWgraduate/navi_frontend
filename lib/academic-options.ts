import type { TFunction } from "i18next";

export const MAJOR_OPTIONS = [
  { value: "ict-convergence", labelKey: "majors.ictConvergence" },
  { value: "ict-design-tech", labelKey: "majors.ictDesignTech" },
  { value: "ict-media-tech", labelKey: "majors.ictMediaTech" },
  { value: "ict-culture-tech", labelKey: "majors.ictCultureTech" },
  { value: "computer-science", labelKey: "majors.computerScience" },
  { value: "artificial-intelligence", labelKey: "majors.artificialIntelligence" },
  { value: "math-data-science", labelKey: "majors.mathDataScience" },
  { value: "business", labelKey: "majors.business" },
] as const;

export const SECOND_MAJOR_OPTIONS = [
  { value: "multiple", labelKey: "common.secondMajorTypes.multiple" },
  { value: "convergence", labelKey: "common.secondMajorTypes.convergence" },
  { value: "minor", labelKey: "common.secondMajorTypes.minor" },
  { value: "double", labelKey: "common.secondMajorTypes.double" },
  { value: "linked", labelKey: "common.secondMajorTypes.linked" },
  { value: "micro", labelKey: "common.secondMajorTypes.micro" },
] as const;

export type MajorCode = (typeof MAJOR_OPTIONS)[number]["value"];
export type SecondMajorTypeCode = (typeof SECOND_MAJOR_OPTIONS)[number]["value"];
export type AcademicStatusCode = "enrolled" | "leave";
export type YearSemesterCode = `${1 | 2 | 3 | 4}-${1 | 2}`;

export function getMajorLabel(t: TFunction, value: MajorCode | "" | null): string {
  if (!value) return "";
  const match = MAJOR_OPTIONS.find((option) => option.value === value);
  return match ? t(match.labelKey) : value;
}

export function getMajorOptions(t: TFunction) {
  return MAJOR_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));
}

export function getSecondMajorTypeLabel(
  t: TFunction,
  value: SecondMajorTypeCode | "" | null
): string {
  if (!value) return "";
  const match = SECOND_MAJOR_OPTIONS.find((option) => option.value === value);
  return match ? t(match.labelKey) : value;
}

export function getSecondMajorTypeOptions(t: TFunction) {
  return SECOND_MAJOR_OPTIONS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));
}

// ===== API 응답 → UI 코드 역변환 =====

/** API의 한국어 학적상태 → UI 코드 */
export function apiAcademicStatusToCode(status: "재학생" | "휴학생"): AcademicStatusCode {
  return status === "재학생" ? "enrolled" : "leave";
}

/** API의 한국어 제2전공 유형 → UI 코드 */
export function apiSecondMajorTypeToCode(
  type: "다중전공" | "융합전공" | "부전공" | "복수전공" | "연계전공" | "마이크로전공" | "없음"
): SecondMajorTypeCode | "" {
  switch (type) {
    case "다중전공": return "multiple";
    case "융합전공": return "convergence";
    case "부전공": return "minor";
    case "복수전공": return "double";
    case "연계전공": return "linked";
    case "마이크로전공": return "micro";
    default: return "";
  }
}

/** completedSemesters → "학년-학기" 코드 (toCompletedSemesters의 역함수) */
export function completedSemestersToYearSemester(completedSemesters: number): YearSemesterCode {
  const year = Math.min(4, Math.max(1, Math.floor(completedSemesters / 2) + 1)) as 1 | 2 | 3 | 4;
  const semester = ((completedSemesters % 2) + 1) as 1 | 2;
  return `${year}-${semester}` as YearSemesterCode;
}

