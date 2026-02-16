import { z } from "zod";

/** 한글이 포함되어 있는지 검사 (완성형·자모 포함) */
const hasKorean = (s: string) => /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(s);

/** 회원가입 2단계 이메일 폼 스키마 (로그인과 동일 규칙) */
export const signupEmailFormSchema = z.object({
  emailPart: z
    .string()
    .trim()
    .min(1, "이메일을 입력해주세요")
    .refine((v) => !hasKorean(v), "이메일에는 한글을 사용할 수 없어요.")
    .refine((v) => v === v.toLowerCase(), "이메일에는 대문자를 사용할 수 없어요."),
});

export type SignupEmailFormValues = z.infer<typeof signupEmailFormSchema>;
