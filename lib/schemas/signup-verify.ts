import { z } from "zod";

const CORRECT_CODE = "000000";

/** 회원가입 3단계 인증번호 6자리 (형식 + 정답 검사) */
export const signupVerifyCodeSchema = z
  .string()
  .length(6, "인증번호 6자리를 입력해주세요")
  .regex(/^\d{6}$/, "숫자 6자리로 입력해주세요")
  .refine((v) => v === CORRECT_CODE, "인증번호가 맞지 않아요. 다시 확인해주세요.");

export type SignupVerifyCodeValue = z.infer<typeof signupVerifyCodeSchema>;

/** 제출 시 검사: 유효시간 + 인증번호 (타이머 만료 먼저 검사) */
export const signupVerifySubmitSchema = z
  .object({
    code: signupVerifyCodeSchema,
    timerSeconds: z.number(),
  })
  .refine((data) => data.timerSeconds > 0, {
    message: "유효시간이 지났어요. 인증번호를 다시 받아주세요.",
    path: ["timerSeconds"],
  });

export type SignupVerifySubmitValues = z.infer<typeof signupVerifySubmitSchema>;

/** 인증번호 다시 받기: 하루 5번까지 */
export const signupVerifyResendSchema = z.object({
  resendCount: z
    .number()
    .refine((n) => n < 5, "인증번호 재발송은 하루 5번까지 가능합니다. 내일 다시 시도해 주세요."),
});

export type SignupVerifyResendValues = z.infer<typeof signupVerifyResendSchema>;
