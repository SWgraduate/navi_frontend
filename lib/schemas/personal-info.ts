import { z } from "zod";
import { signupCompleteStudentIdSchema } from "@/lib/schemas/signup-complete";

/** 마이페이지 - 이름 수정용 스키마 (특수문자 금지) */
export const personalNameSchema = z
  .string()
  .trim()
  .min(1, "이름을 입력해주세요")
  .regex(/^[가-힣a-zA-Z\s]+$/, "이름에 특수문자를 포함할 수 없어요");

/** 마이페이지 - 학번 수정용 스키마 (회원가입과 동일 규칙) */
export const personalStudentIdSchema = signupCompleteStudentIdSchema;

export type PersonalNameValue = z.infer<typeof personalNameSchema>;
export type PersonalStudentIdValue = z.infer<typeof personalStudentIdSchema>;

