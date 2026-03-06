import { z } from "zod";

/** 회원가입 4단계 이름 */
export const signupNameFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "errors.name.empty"),
});

export type SignupNameFormValues = z.infer<typeof signupNameFormSchema>;
