import { z } from "zod";

/** 학번: 201/202/203으로 시작, 총 10자리 숫자 */
export const signupCompleteStudentIdSchema = z
  .string()
  .trim()
  .length(10, "학번 10자리를 입력해주세요")
  .regex(/^\d{10}$/, "숫자만 입력해주세요")
  .refine((v) => /^20[123]/.test(v), "학번을 올바르게 입력해주세요");

/** 학년·학기: "N-N" 형식 (예: 1-1, 2-2) */
const yearSemesterSchema = z
  .string()
  .trim()
  .min(1, "이수 학년/학기를 선택해주세요")
  .regex(/^[1-4]-[12]$/, "학년/학기를 선택해주세요");

/** 6단계 학적 정보 폼 (주전공·제2전공 중복 불가) */
export const signupCompleteFormSchema = z
  .object({
    studentId: signupCompleteStudentIdSchema,
    major: z.string().trim().min(1, "주전공을 선택해주세요"),
    secondMajorType: z.string(),
    secondMajor: z.string(),
    academicStatus: z
      .enum(["enrolled", "leave"], { required_error: "학적상태를 선택해주세요" })
      .or(z.literal("")),
    yearSemester: yearSemesterSchema.or(z.literal("")),
  })
  .refine((data) => data.academicStatus !== "", {
    message: "학적상태를 선택해주세요",
    path: ["academicStatus"],
  })
  .refine((data) => data.yearSemester.trim() !== "" && /^[1-4]-[12]$/.test(data.yearSemester), {
    message: "이수 학년/학기를 선택해주세요",
    path: ["yearSemester"],
  })
  .refine(
    (data) => {
      if (!data.secondMajorType || !data.secondMajor.trim()) return true;
      return data.major.trim() !== data.secondMajor.trim();
    },
    { message: "주전공과 제2전공이 같을 수 없어요", path: ["secondMajor"] }
  );

export type SignupCompleteFormValues = z.infer<typeof signupCompleteFormSchema>;
