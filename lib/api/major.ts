import { apiFetch } from "./client";

export type GraduationRequirements = {
  requiredCredits: {
    total: number;
    gpa: number;
    majorCore: number;
    majorAdvanced: number;
    majorTotal: number;
    generalElective: number;
    socialService: number;
    industry: number;
  };
  requiredSecondMajorCredits?: {
    majorCore: number;
    majorTotal: number;
  };
  requiredConditions: {
    hasThesis: boolean;
    hasMandatoryCourse: boolean;
    hasPrerequisite: boolean;
    pblMajor: number;
    pblTotal: number;
    englishCourses: number;
  };
};

export type GetGraduationRequirementsParams = {
  major: string;
  admissionYear: number;
  isTransfer?: boolean;
  secondMajorType?: string;
};

/** GET /majors/graduation-requirements */
export async function getGraduationRequirements(
  params: GetGraduationRequirementsParams
): Promise<GraduationRequirements> {
  const query = new URLSearchParams({
    major: params.major,
    admissionYear: String(params.admissionYear),
    ...(params.isTransfer != null ? { isTransfer: String(params.isTransfer) } : {}),
    ...(params.secondMajorType ? { secondMajorType: params.secondMajorType } : {}),
  });
  return apiFetch<GraduationRequirements>(`/majors/graduation-requirements?${query}`);
}
