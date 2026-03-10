import { z } from "zod";

/** 회원가입 3단계 인증번호 6자리 (형식만 검사, 정답 검사는 서버에서 수행) */
export const signupVerifyCodeSchema = z
  .string()
  .length(6, "errors.verifyCode.length")
  .regex(/^\d{6}$/, "errors.verifyCode.numeric");

export type SignupVerifyCodeValue = z.infer<typeof signupVerifyCodeSchema>;

/** 제출 시 검사: 유효시간 + 인증번호 (타이머 만료 먼저 검사) */
export const signupVerifySubmitSchema = z
  .object({
    code: signupVerifyCodeSchema,
    timerSeconds: z.number(),
  })
  .refine((data) => data.timerSeconds > 0, {
    message: "errors.verifyCode.expired",
    path: ["timerSeconds"],
  });

export type SignupVerifySubmitValues = z.infer<typeof signupVerifySubmitSchema>;

/** 인증번호 다시 받기: 하루 5번까지 */
export const signupVerifyResendSchema = z.object({
  resendCount: z
    .number()
    .refine((n) => n < 5, "errors.verifyCode.resendLimit"),
});

export type SignupVerifyResendValues = z.infer<typeof signupVerifyResendSchema>;
