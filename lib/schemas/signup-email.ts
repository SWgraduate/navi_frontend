import { z } from "zod";

/** 한글이 포함되어 있는지 검사 (완성형·자모 포함) */
const hasKorean = (s: string) => /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(s);

/** 회원가입 2단계 이메일 폼 스키마 (로그인과 동일 규칙) */
export const signupEmailFormSchema = z.object({
  emailPart: z
    .string()
    .trim()
    .min(1, "errors.email.empty")
    .refine((v) => !hasKorean(v), "errors.email.koreanSignup")
    .refine((v) => v === v.toLowerCase(), "errors.email.uppercaseSignup"),
});

export type SignupEmailFormValues = z.infer<typeof signupEmailFormSchema>;
