import { z } from "zod";
import { signupCompleteStudentIdSchema } from "@/lib/schemas/signup-complete";

/** 마이페이지 - 이름 수정용 스키마 (특수문자 금지) */
export const personalNameSchema = z
  .string()
  .trim()
  .min(1, "errors.personalName.empty")
  .regex(/^[가-힣a-zA-Z\s]+$/, "errors.personalName.special");

/** 마이페이지 - 학번 수정용 스키마 (회원가입과 동일 규칙) */
export const personalStudentIdSchema = signupCompleteStudentIdSchema;

/** 마이페이지 - 학적상태 스키마 (재학생 / 휴학생) */
export const personalAcademicStatusSchema = z.enum(["enrolled", "leave"], {
  required_error: "errors.academicStatus.required",
});

/** 마이페이지 - 현재 이수한 학년/학기 스키마 ("N-N" 형식, 예: 3-2) */
export const personalYearSemesterSchema = z
  .string()
  .trim()
  .regex(/^[1-4]-[12]$/, "errors.yearSemester.format");

export type PersonalNameValue = z.infer<typeof personalNameSchema>;
export type PersonalStudentIdValue = z.infer<typeof personalStudentIdSchema>;
export type PersonalAcademicStatusValue = z.infer<typeof personalAcademicStatusSchema>;
export type PersonalYearSemesterValue = z.infer<typeof personalYearSemesterSchema>;
