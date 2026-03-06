import { z } from "zod";

/** 한글이 포함되어 있는지 검사 (완성형·자모 포함) */
const hasKorean = (s: string) => /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(s);

/** 로그인 폼 필드 스키마 (이메일 앞부분 + 비밀번호) */
export const loginFormSchema = z
  .object({
    emailPart: z
      .string()
      .trim()
      .min(1, "errors.email.empty")
      .refine((v) => !hasKorean(v), "errors.email.korean")
      .refine((v) => v === v.toLowerCase(), "errors.email.uppercase"),
    password: z
      .string()
      .min(8, "errors.password.minLength")
      .refine((v) => !hasKorean(v), "errors.password.korean"),
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
