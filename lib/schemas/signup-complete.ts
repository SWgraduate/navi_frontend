import { z } from "zod";

/** 학번: 201/202/203으로 시작, 총 10자리 숫자 */
export const signupCompleteStudentIdSchema = z
  .string()
  .trim()
  .length(10, "errors.studentId.length")
  .regex(/^\d{10}$/, "errors.studentId.numeric")
  .refine((v) => /^20[123]/.test(v), "errors.studentId.format");

/** 학년·학기: "N-N" 형식 (예: 1-1, 2-2) */
const yearSemesterSchema = z
  .string()
  .trim()
  .min(1, "errors.yearSemester.empty")
  .regex(/^[1-4]-[12]$/, "errors.yearSemester.format");

/** 6단계 학적 정보 폼 (주전공·제2전공 중복 불가) */
export const signupCompleteFormSchema = z
  .object({
    studentId: signupCompleteStudentIdSchema,
    major: z.string().trim().min(1, "errors.major.empty"),
    secondMajorType: z.string(),
    secondMajor: z.string(),
    academicStatus: z
      .enum(["enrolled", "leave"], { required_error: "errors.academicStatus.required" })
      .or(z.literal("")),
    yearSemester: yearSemesterSchema.or(z.literal("")),
  })
  .refine((data) => data.academicStatus !== "", {
    message: "errors.academicStatus.required",
    path: ["academicStatus"],
  })
  .refine((data) => data.yearSemester.trim() !== "" && /^[1-4]-[12]$/.test(data.yearSemester), {
    message: "errors.yearSemester.empty",
    path: ["yearSemester"],
  })
  .refine(
    (data) => {
      if (!data.secondMajorType || !data.secondMajor.trim()) return true;
      return data.major.trim() !== data.secondMajor.trim();
    },
    { message: "errors.secondMajor.duplicate", path: ["secondMajor"] }
  );

export type SignupCompleteFormValues = z.infer<typeof signupCompleteFormSchema>;
