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

