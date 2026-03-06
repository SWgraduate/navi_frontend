import { z } from "zod";

export const PASSWORD_RULE_MESSAGE = "errors.password.rule";

/** 회원가입 5단계 비밀번호 (8~16자, 영문 대소문자·숫자·특수문자 + 재확인) */
export const signupPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, PASSWORD_RULE_MESSAGE)
      .max(16, PASSWORD_RULE_MESSAGE)
      .refine(
        (v) => {
          // 영문 대소문자, 숫자, 특수문자 조합 (조건은 필요에 따라 수정)
          const hasUpper = /[A-Z]/.test(v);
          const hasLower = /[a-z]/.test(v);
          const hasDigit = /\d/.test(v);
          const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v);
          return hasUpper && hasLower && hasDigit && hasSpecial;
        },
        { message: PASSWORD_RULE_MESSAGE }
      ),
    passwordConfirm: z.string().min(1, "errors.passwordConfirm.empty"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "errors.passwordConfirm.mismatch",
    path: ["passwordConfirm"],
  });

export type SignupPasswordFormValues = z.infer<typeof signupPasswordFormSchema>;
