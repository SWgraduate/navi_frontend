import { apiFetch, type ApiError } from "./client";

/**
 * 학생(Student) / 학적·이수 현황 관련 API 모음입니다.
 *
 * - **어떤 화면/흐름에서 쓰나**
 *   - (추후) 마이페이지/프로필 입력 및 수정
 *   - (추후) 졸업사정/이수 현황 조회
 *   - (추후) `app/graduation/*`에서 이미지 파싱 결과를 백엔드에 반영할 때
 *
 * - **인증**: Swagger 기준 세션 쿠키(`connect.sid`)가 필요할 수 있어 `apiFetch` 기본값(`credentials: include`)을 사용합니다.
 * - **타입**: 아래 타입들은 Swagger 스키마를 그대로 옮긴 “API 경계 타입”입니다.
 */

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

