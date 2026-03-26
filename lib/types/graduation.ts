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

/** 모든 필드를 빈 문자열로 초기화한 Credits 객체 반환 */
export function getDefaultCredits(): Credits {
  return Object.fromEntries(CREDIT_KEYS.map((k) => [k, ""])) as Credits;
}
