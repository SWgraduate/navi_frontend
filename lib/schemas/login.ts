import { z } from "zod";

/** 한글이 포함되어 있는지 검사 (완성형·자모 포함) */
const hasKorean = (s: string) => /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(s);

/** 로그인 폼 필드 스키마 (이메일 앞부분 + 비밀번호) */
export const loginFormSchema = z
  .object({
    emailPart: z
      .string()
      .trim()
      .min(1, "이메일을 입력해주세요")
      .refine((v) => !hasKorean(v), "이메일에는 한글을 사용할 수 없습니다")
      .refine((v) => v === v.toLowerCase(), "이메일에는 대문자를 사용할 수 없습니다"),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다")
      .refine((v) => !hasKorean(v), "비밀번호에는 한글을 사용할 수 없습니다"),
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
