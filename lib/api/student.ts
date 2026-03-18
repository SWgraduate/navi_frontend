import { apiFetch, type ApiError } from "./client";

export type ApiErrorShape = ApiError;

// ===== Schemas (from Swagger) =====

export type SecondMajorType =
  | "다중전공"
  | "융합전공"
  | "부전공"
  | "복수전공"
  | "연계전공"
  | "마이크로전공"
  | "없음";

export type AcademicStatus = "재학생" | "휴학생";

export type StudentResponse = {
  id: string;
  userId: string;
  admissionYear: number;
  studentNumber: string;
  name: string;
  major: string;
  secondMajorType: SecondMajorType;
  secondMajor?: string;
  academicStatus: AcademicStatus;
  completedSemesters: number;
};

export type UpsertProfileRequest = {
  admissionYear: number;
  studentNumber: string;
  name: string;
  major: string;
  secondMajorType: SecondMajorType;
  secondMajor?: string;
  academicStatus: AcademicStatus;
  completedSemesters: number;
};

export type EarnedCredits = {
  total: number;
  majorCore: number;
  majorAdvanced: number;
  majorTotal: number;
  generalElective: number;
  socialService: number;
  industry: number;
};

export type SecondMajorCredits = {
  majorTotal: number;
  majorCore: number;
};

export type CompletedConditions = {
  englishCourses: number;
  pblTotal: number;
  pblMajor: number;
  hasPrerequisite: boolean;
  hasMandatoryCourse: boolean;
  hasThesis: boolean;
};

export type TakenCourse = {
  courseCode: string;
  courseName: string;
  category: string;
  credit: number;
  isEnglish: boolean;
  isPbl: boolean;
  isMajorPbl: boolean;
};

export type AcademicRecordResponse = {
  id: string;
  studentId: string;
  earnedCredits: EarnedCredits;
  secondMajorCredits: SecondMajorCredits;
  completedConditions: CompletedConditions;
  takenCourses: TakenCourse[];
};

export type UpdateAcademicRecordRequest = {
  earnedCredits?: Partial<EarnedCredits>;
  secondMajorCredits?: Partial<SecondMajorCredits>;
  completedConditions?: Partial<CompletedConditions>;
  takenCourses?: TakenCourse[];
};

export type ParseImageRequest = {
  imageBase64: string;
};

// ===== Endpoints =====

/** POST /student/me/profile */
export async function upsertMyProfile(
  payload: UpsertProfileRequest
): Promise<StudentResponse | ApiErrorShape> {
  return apiFetch<StudentResponse | ApiErrorShape>("/student/me/profile", {
    method: "POST",
    body: payload,
  });
}

/** GET /student/me/profile */
export async function getMyProfile(): Promise<StudentResponse | ApiErrorShape> {
  return apiFetch<StudentResponse | ApiErrorShape>("/student/me/profile", {
    method: "GET",
  });
}

/** GET /student/me/academic-record */
export async function getMyAcademicRecord(): Promise<AcademicRecordResponse | ApiErrorShape> {
  return apiFetch<AcademicRecordResponse | ApiErrorShape>("/student/me/academic-record", {
    method: "GET",
  });
}

/** PUT /student/me/academic-record */
export async function updateMyAcademicRecord(
  payload: UpdateAcademicRecordRequest
): Promise<AcademicRecordResponse | ApiErrorShape> {
  return apiFetch<AcademicRecordResponse | ApiErrorShape>("/student/me/academic-record", {
    method: "PUT",
    body: payload,
  });
}

/** POST /student/me/academic-record/parse */
export async function parseAndUpdateMyAcademicRecordFromImage(
  payload: ParseImageRequest
): Promise<AcademicRecordResponse | ApiErrorShape> {
  return apiFetch<AcademicRecordResponse | ApiErrorShape>("/student/me/academic-record/parse", {
    method: "POST",
    body: payload,
  });
}

