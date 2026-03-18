"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";
import { signupCompleteFormSchema } from "@/lib/schemas/signup-complete";
import { Search } from "lucide-react";
import { MajorSelectSheet } from "@/components/personal/major-select-sheet";
import { useTranslation } from "react-i18next";
import {
  getMajorOptions,
  getSecondMajorTypeOptions,
  type MajorCode,
  type SecondMajorTypeCode,
} from "@/lib/academic-options";
import { register } from "@/lib/api/auth";
import { upsertMyProfile, type SecondMajorType, type AcademicStatus as StudentAcademicStatus } from "@/lib/api/student";
import { setLoggedIn, saveEmail } from "@/lib/auth-storage";

function UpDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M7 15L12 20L17 15"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 9L12 4L17 9"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DropdownDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DropdownUpIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M18 15L12 9L6 15"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const sheetOverlayVariants = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
};

/** top/bottom으로 열고 닫아서 transform 미사용 → 모바일 터치 좌표 어긋남 방지 */
const sheetPanelVariants = {
  open: { top: "auto" as const, bottom: 0 },
  closed: { top: "100%", bottom: "auto" as const },
};

type AcademicStatusCode = "enrolled" | "leave";

/** Figma 6/6: 회원가입 - 학적 정보 입력 */
export default function SignupCompletePage() {
  const router = useRouter();
  const { t } = useTranslation();
  useHeaderBackground("white");

  const [studentId, setStudentId] = useState("");
  const [major, setMajor] = useState<MajorCode | "">("");
  const [secondMajorType, setSecondMajorType] = useState<SecondMajorTypeCode | "">("");
  const [academicStatus, setAcademicStatus] = useState<AcademicStatusCode | "">("");
  const [yearSemester, setYearSemester] = useState("");
  const [majorSheetOpen, setMajorSheetOpen] = useState(false);
  const [secondMajorSheetOpen, setSecondMajorSheetOpen] = useState(false);
  const [secondMajor, setSecondMajor] = useState<MajorCode | "">("");
  const [secondMajorPickerOpen, setSecondMajorPickerOpen] = useState(false);
  const [secondMajorPickerSearch, setSecondMajorPickerSearch] = useState("");
  const [yearSemesterSheetOpen, setYearSemesterSheetOpen] = useState(false);
  const [sheetYear, setSheetYear] = useState<number | null>(null);
  const [sheetSemester, setSheetSemester] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const secondMajorTypeDragControls = useDragControls();
  const secondMajorPickerDragControls = useDragControls();
  const yearSemesterDragControls = useDragControls();

  const handleSheetDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { y: number }; velocity: { y: number } },
    onClose: () => void
  ) => {
    if (info.offset.y > 80 || info.velocity.y > 300) onClose();
  };

  const YEAR_OPTIONS = [1, 2, 3, 4] as const;
  const SEMESTER_OPTIONS = [1, 2] as const;
  const majorOptions = useMemo(() => getMajorOptions(t), [t]);
  const secondMajorTypeOptions = useMemo(() => getSecondMajorTypeOptions(t), [t]);
  const selectedSecondMajorTypeLabel =
    secondMajorTypeOptions.find((option) => option.value === secondMajorType)?.label ?? "";
  const selectedMajorLabel = majorOptions.find((option) => option.value === major)?.label ?? "";
  const selectedSecondMajorLabel =
    majorOptions.find((option) => option.value === secondMajor)?.label ?? "";

  const openYearSemesterSheet = () => {
    if (yearSemester) {
      const [y, s] = yearSemester.split("-").map(Number);
      setSheetYear(y);
      setSheetSemester(s);
    } else {
      setSheetYear(null);
      setSheetSemester(null);
    }
    setYearSemesterSheetOpen(true);
  };

  const confirmYearSemester = () => {
    if (sheetYear != null && sheetSemester != null) {
      setYearSemester(`${sheetYear}-${sheetSemester}`);
      if (formErrors.yearSemester) setFormErrors((p) => ({ ...p, yearSemester: "" }));
    }
    setYearSemesterSheetOpen(false);
  };

  const yearSemesterDisplay =
    yearSemester && yearSemester.includes("-")
      ? (() => {
          const [y, s] = yearSemester.split("-").map(Number);
          return t("signup.complete.yearSemesterDisplay", { y, s });
        })()
      : "";

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollAreaRef.current?.focus({ preventScroll: true });
  }, []);

  const filteredSecondMajors = useMemo(() => {
    if (!secondMajorPickerSearch.trim()) return majorOptions;
    const q = secondMajorPickerSearch.trim().toLowerCase();
    return majorOptions.filter((option) => option.label.toLowerCase().includes(q));
  }, [majorOptions, secondMajorPickerSearch]);

  const canSubmit =
    studentId.trim().length > 0 &&
    major.length > 0 &&
    academicStatus.length > 0 &&
    yearSemester.length > 0;

  const mapSecondMajorType = (code: SecondMajorTypeCode | ""): SecondMajorType => {
    switch (code) {
      case "multiple":
        return "다중전공";
      case "convergence":
        return "융합전공";
      case "minor":
        return "부전공";
      case "double":
        return "복수전공";
      case "linked":
        return "연계전공";
      case "micro":
        return "마이크로전공";
      default:
        return "없음";
    }
  };

  const mapAcademicStatus = (code: AcademicStatusCode): StudentAcademicStatus => {
    return code === "enrolled" ? "재학생" : "휴학생";
  };

  const inferAdmissionYearFromStudentNumber = (studentNumber: string): number => {
    const prefix = studentNumber.trim().slice(0, 4);
    const n = Number(prefix);
    const currentYear = new Date().getFullYear();
    return Number.isFinite(n) && n >= 1980 && n <= currentYear + 1 ? n : currentYear;
  };

  const toCompletedSemesters = (ys: string): number => {
    const [yRaw, sRaw] = ys.split("-");
    const y = Number(yRaw);
    const s = Number(sRaw);
    if (!Number.isFinite(y) || !Number.isFinite(s) || y < 1 || y > 12 || (s !== 1 && s !== 2)) {
      return 0;
    }
    // "현재 이수중인 학년/학기" 기준 → 이미 완료한 학기 수
    return Math.max(0, (y - 1) * 2 + (s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const result = signupCompleteFormSchema.safeParse({
      studentId: studentId.trim(),
      major: major.trim(),
      secondMajorType,
      secondMajor: secondMajor.trim(),
      academicStatus,
      yearSemester: yearSemester.trim(),
    });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const next: Record<string, string> = {};
      for (const [key, messages] of Object.entries(fieldErrors)) {
        if (messages?.[0]) next[key] = messages[0];
      }
      setFormErrors(next);
      return;
    }
    setFormErrors({});

    const email = typeof window !== "undefined" ? sessionStorage.getItem("signup_email") : null;
    const name = typeof window !== "undefined" ? sessionStorage.getItem("signup_name") : null;
    const password = typeof window !== "undefined" ? sessionStorage.getItem("signup_password") : null;

    if (!email || !password) {
      setSubmitError("회원가입 정보가 누락되었습니다. 이메일 인증 단계부터 다시 진행해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1) 계정 생성 (Swagger 상 필수: email, password)
      await register({ email, password, name: name ?? "" });

      // 2) 학적 기본정보 업서트 (세션 쿠키 필요 가능)
      const studentNumber = result.data.studentId.trim();
      await upsertMyProfile({
        admissionYear: inferAdmissionYearFromStudentNumber(studentNumber),
        studentNumber,
        name: (name ?? "").trim() || "사용자",
        major: result.data.major.trim(),
        secondMajorType: mapSecondMajorType(result.data.secondMajorType as SecondMajorTypeCode | ""),
        secondMajor: result.data.secondMajor.trim() || undefined,
        academicStatus: mapAcademicStatus(result.data.academicStatus as AcademicStatusCode),
        completedSemesters: toCompletedSemesters(result.data.yearSemester),
      });

      if (email) saveEmail(email);
      setLoggedIn(true);
      withViewTransition(() => router.push("/signup/welcome"));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div
        ref={scrollAreaRef}
        tabIndex={0}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4 pb-8 outline-none"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        <div className="flex min-h-screen flex-col gap-4 pb-24">
        <p className="text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
          <span className="text-ds-brand">6</span> / 6
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            {t("signup.complete.title")}
          </h1>
          <p className="text-ds-body-16-r leading-ds-body-16-r text-ds-tertiary">
            {t("signup.complete.subtitle")}
          </p>
        </div>

        <form
          id="signup-complete-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-student-id"
              className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
            >
              {t("signup.complete.studentIdLabel")} <span className="text-destructive">*</span>
            </label>
            <input
              id="signup-student-id"
              type="text"
              inputMode="numeric"
              placeholder={t("signup.complete.studentIdPlaceholder")}
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                if (formErrors.studentId) setFormErrors((p) => ({ ...p, studentId: "" }));
              }}
              className={cn(
                "rounded-md border-2 bg-secondary p-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:outline-none focus:ring-0",
                formErrors.studentId ? "border-destructive" : "border-transparent focus:border-primary"
              )}
            />
            {formErrors.studentId && (
              <p className="text-ds-caption-14-r text-destructive">{t(formErrors.studentId)}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-major-trigger"
              className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
            >
              {t("signup.complete.majorLabel")} <span className="text-destructive">*</span>
            </label>
            <button
              id="signup-major-trigger"
              type="button"
              onClick={() => {
                setMajorSheetOpen(true);
                if (formErrors.major) setFormErrors((p) => ({ ...p, major: "" }));
              }}
              className={cn(
                "relative flex w-full items-center justify-between rounded-md border-2 bg-secondary p-4 pr-10 text-left text-ds-body-16-r leading-ds-body-16-r focus:outline-none focus:ring-0",
                formErrors.major ? "border-destructive" : "border-transparent focus:border-primary"
              )}
            >
              <span className={cn(major ? "text-ds-gray-90" : "text-ds-tertiary")}>
                {selectedMajorLabel || t("signup.complete.majorPlaceholder")}
              </span>
              <UpDownIcon className="absolute right-3 h-6 w-6 shrink-0 text-ds-tertiary" />
            </button>
            {formErrors.major && (
              <p className="text-ds-caption-14-r text-destructive">{t(formErrors.major)}</p>
            )}
          </div>

          {/* 주전공 선택 바텀시트 (Figma 1105-11744) */}
          <MajorSelectSheet
            open={majorSheetOpen}
            selected={major}
            options={majorOptions}
            onOpenChange={setMajorSheetOpen}
            onSelect={(next) => {
              setMajor(next as MajorCode | "");
              if (formErrors.major) setFormErrors((p) => ({ ...p, major: "" }));
            }}
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-second-major-trigger"
              className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
            >
              {t("signup.complete.secondMajorTypeLabel")}
            </label>
            <button
              id="signup-second-major-trigger"
              type="button"
              onClick={() => setSecondMajorSheetOpen(true)}
              className={cn(
                "relative flex w-full items-center justify-between rounded-md border-2 border-transparent bg-secondary p-4 pr-10 text-left text-ds-body-16-r leading-ds-body-16-r focus:border-primary focus:outline-none focus:ring-0",
                secondMajorType ? "text-ds-gray-90" : "text-ds-tertiary"
              )}
            >
              <span>{selectedSecondMajorTypeLabel || t("signup.complete.secondMajorTypePlaceholder")}</span>
              {secondMajorSheetOpen ? (
                <DropdownUpIcon className="absolute right-3 h-6 w-6 shrink-0 text-ds-tertiary" />
              ) : (
                <DropdownDownIcon className="absolute right-3 h-6 w-6 shrink-0 text-ds-tertiary" />
              )}
            </button>
          </div>

          {/* 제2전공 유형 선택 바텀시트 (Figma 1105-12985) */}
          <AnimatePresence>
            {secondMajorSheetOpen && (
              <>
                <motion.div
                  className="fixed inset-0 z-40 bg-black/40"
                  aria-hidden
                  onClick={() => setSecondMajorSheetOpen(false)}
                  variants={sheetOverlayVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] h-fit flex-col rounded-t-xl bg-white shadow-lg pb-[max(1rem,env(safe-area-inset-bottom))]"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="second-major-sheet-title"
                  variants={sheetPanelVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ bottom: 0.25 }}
                  dragListener={false}
                  dragControls={secondMajorTypeDragControls}
                  onDragEnd={(e, info) => handleSheetDragEnd(e, info, () => setSecondMajorSheetOpen(false))}
                >
                <div className="flex shrink-0 flex-col gap-2 px-4 pt-2">
                  <div
                    className="flex min-h-[56px] cursor-grab active:cursor-grabbing flex-col items-center justify-center gap-2 py-2 touch-none"
                    aria-hidden
                    onPointerDown={(e) => secondMajorTypeDragControls.start(e)}
                  >
                    <div className="h-1.5 w-12 rounded-full bg-[#EEEFF1]" />
                    <h2 id="second-major-sheet-title" className="text-center text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary pointer-events-none">
                      {t("signup.complete.secondMajorTypePickerTitle")}
                    </h2>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden px-4 max-h-[60vh] touch-manipulation [-webkit-overflow-scrolling:touch]">
                  {secondMajorTypeOptions.map((option) => (
                    <li key={option.value} className="flex">
                      <button
                        type="button"
                        onClick={() => {
                          if (secondMajorType === option.value) {
                            setSecondMajorType("");
                            setSecondMajor("");
                          } else {
                            setSecondMajorType(option.value as SecondMajorTypeCode);
                          }
                          setSecondMajorSheetOpen(false);
                        }}
                        className="w-full min-h-[52px] cursor-pointer select-none py-5 px-4 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:bg-ds-gray-10 touch-manipulation"
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {secondMajorType && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="signup-second-major-picker-trigger"
                className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
              >
                {t("signup.complete.secondMajorLabel")}
              </label>
              <button
                id="signup-second-major-picker-trigger"
                type="button"
                onClick={() => {
                  setSecondMajorPickerOpen(true);
                  if (formErrors.secondMajor) setFormErrors((p) => ({ ...p, secondMajor: "" }));
                }}
                className={cn(
                  "relative flex w-full items-center justify-between rounded-md border-2 bg-secondary p-4 pr-10 text-left text-ds-body-16-r leading-ds-body-16-r focus:outline-none focus:ring-0",
                  formErrors.secondMajor
                    ? "border-destructive"
                    : "border-transparent focus:border-primary",
                  secondMajor ? "text-ds-gray-90" : "text-ds-tertiary"
                )}
              >
                <span>{selectedSecondMajorLabel || t("signup.complete.secondMajorPlaceholder")}</span>
                <UpDownIcon className="absolute right-3 h-6 w-6 shrink-0 text-ds-tertiary" />
              </button>
              {formErrors.secondMajor && (
                <p className="text-ds-caption-14-r text-destructive">{t(formErrors.secondMajor)}</p>
              )}
            </div>
          )}

          {/* 제2전공 선택 바텀시트 (Figma 1086-6608) */}
          <AnimatePresence>
            {secondMajorPickerOpen && (
              <>
                <motion.div
                  className="fixed inset-0 z-40 bg-black/40"
                  aria-hidden
                  onClick={() => setSecondMajorPickerOpen(false)}
                  variants={sheetOverlayVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] h-fit flex-col rounded-t-xl bg-white shadow-lg pb-[max(1rem,env(safe-area-inset-bottom))]"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="second-major-picker-sheet-title"
                  variants={sheetPanelVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ bottom: 0.25 }}
                  dragListener={false}
                  dragControls={secondMajorPickerDragControls}
                  onDragEnd={(e, info) => handleSheetDragEnd(e, info, () => setSecondMajorPickerOpen(false))}
                >
                  <div className="flex shrink-0 flex-col gap-2 px-4 pt-2">
                    <div
                      className="flex min-h-[56px] cursor-grab active:cursor-grabbing flex-col items-center justify-center gap-2 py-2 touch-none"
                      aria-hidden
                      onPointerDown={(e) => secondMajorPickerDragControls.start(e)}
                    >
                      <div className="h-1.5 w-12 rounded-full bg-[#EEEFF1]" />
                      <h2 id="second-major-picker-sheet-title" className="text-center text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary pointer-events-none">
                        {t("signup.complete.secondMajorPickerTitle")}
                      </h2>
                    </div>
                    <div className="relative flex min-h-[48px] items-center rounded-md border-2 border-transparent bg-secondary focus-within:border-primary">
                      <Search className="absolute left-3 h-5 w-5 shrink-0 text-ds-tertiary pointer-events-none" aria-hidden />
                      <input
                        type="search"
                        placeholder={t("sheets.majorSelect.searchPlaceholder")}
                        value={secondMajorPickerSearch}
                        onChange={(e) => setSecondMajorPickerSearch(e.target.value)}
                        className="w-full min-h-[48px] rounded-md bg-transparent py-3 pl-10 pr-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:outline-none focus:ring-0 touch-manipulation"
                      />
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden px-4 max-h-[60vh] touch-manipulation [-webkit-overflow-scrolling:touch]">
                    {filteredSecondMajors.map((option) => (
                      <li key={option.value} className="flex">
                        <button
                          type="button"
                          onClick={() => {
                            setSecondMajor(secondMajor === option.value ? "" : option.value);
                            setSecondMajorPickerOpen(false);
                            setSecondMajorPickerSearch("");
                            if (formErrors.secondMajor) setFormErrors((p) => ({ ...p, secondMajor: "" }));
                          }}
                          className="w-full min-h-[52px] cursor-pointer select-none py-5 px-4 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:bg-ds-gray-10 touch-manipulation"
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                    {filteredSecondMajors.length === 0 && (
                      <li className="py-4 text-center text-ds-caption-14-r text-ds-tertiary">
                        {t("sheets.majorSelect.noResults")}
                      </li>
                    )}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2">
            <span className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary">
              {t("signup.complete.academicStatusLabel")} <span className="text-destructive">*</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAcademicStatus("enrolled");
                  if (formErrors.academicStatus) setFormErrors((p) => ({ ...p, academicStatus: "" }));
                }}
                className={cn(
                  "flex-1 rounded-md border-2 py-3 text-ds-body-16-r leading-ds-body-16-r",
                  academicStatus === "enrolled"
                    ? "border-primary bg-primary/10 text-primary"
                    : formErrors.academicStatus
                      ? "border-destructive bg-secondary text-ds-tertiary"
                      : "border-transparent bg-secondary text-ds-tertiary"
                )}
              >
                {t("signup.complete.enrolled")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAcademicStatus("leave");
                  if (formErrors.academicStatus) setFormErrors((p) => ({ ...p, academicStatus: "" }));
                }}
                className={cn(
                  "flex-1 rounded-md border-2 py-3 text-ds-body-16-r leading-ds-body-16-r",
                  academicStatus === "leave"
                    ? "border-primary bg-primary/10 text-primary"
                    : formErrors.academicStatus
                      ? "border-destructive bg-secondary text-ds-tertiary"
                      : "border-transparent bg-secondary text-ds-tertiary"
                )}
              >
                {t("signup.complete.leave")}
              </button>
            </div>
            {formErrors.academicStatus && (
              <p className="text-ds-caption-14-r text-destructive">{t(formErrors.academicStatus)}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-year-semester-trigger"
              className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
            >
              {t("signup.complete.yearSemesterLabel")} <span className="text-destructive">*</span>
            </label>
            <button
              id="signup-year-semester-trigger"
              type="button"
              onClick={() => {
                openYearSemesterSheet();
                if (formErrors.yearSemester) setFormErrors((p) => ({ ...p, yearSemester: "" }));
              }}
              className={cn(
                "flex w-full items-center rounded-md border-2 bg-secondary p-4 text-left text-ds-body-16-r leading-ds-body-16-r focus:outline-none focus:ring-0",
                formErrors.yearSemester ? "border-destructive" : "border-transparent focus:border-primary",
                yearSemesterDisplay ? "text-ds-gray-90" : "text-ds-tertiary"
              )}
            >
              <span>{yearSemesterDisplay || t("signup.complete.yearSemesterPlaceholder")}</span>
            </button>
            {formErrors.yearSemester && (
              <p className="text-ds-caption-14-r text-destructive">{t(formErrors.yearSemester)}</p>
            )}
          </div>

          {/* 현재 이수한 학년/학기 바텀시트 (Figma 1113-9691) */}
          <AnimatePresence>
            {yearSemesterSheetOpen && (
              <>
                <motion.div
                  className="fixed inset-0 z-40 bg-black/40"
                  aria-hidden
                  onClick={() => setYearSemesterSheetOpen(false)}
                  variants={sheetOverlayVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] h-fit flex-col rounded-t-xl bg-white shadow-lg pb-[max(1rem,env(safe-area-inset-bottom))]"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="year-semester-sheet-title"
                  variants={sheetPanelVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ bottom: 0.25 }}
                  dragListener={false}
                  dragControls={yearSemesterDragControls}
                  onDragEnd={(e, info) => handleSheetDragEnd(e, info, () => setYearSemesterSheetOpen(false))}
                >
                  <div className="flex shrink-0 flex-col gap-2 px-4 pt-2">
                    <div
                      className="flex min-h-[56px] cursor-grab active:cursor-grabbing flex-col items-center justify-center gap-2 py-2 touch-none"
                      aria-hidden
                      onPointerDown={(e) => yearSemesterDragControls.start(e)}
                    >
                      <div className="h-1.5 w-12 rounded-full bg-[#EEEFF1]" />
                      <h2 id="year-semester-sheet-title" className="text-center text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary pointer-events-none">
                        {t("signup.complete.yearSemesterPickerTitle")}
                      </h2>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <ul className="flex flex-col gap-2">
                        {YEAR_OPTIONS.map((y) => (
                          <li key={y} className="flex">
                            <button
                              type="button"
                              onClick={() => setSheetYear(sheetYear === y ? null : y)}
                              className={cn(
                                "w-full min-h-[52px] cursor-pointer select-none rounded-md py-5 text-center text-ds-body-16-r leading-ds-body-16-r touch-manipulation",
                                sheetYear === y
                                  ? "bg-primary/10 font-semibold text-ds-gray-90"
                                  : "text-ds-gray-90"
                              )}
                            >
                              {t("signup.complete.year", { n: y })}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="min-w-0 flex-1">
                      <ul className="flex flex-col gap-2">
                        {SEMESTER_OPTIONS.map((s) => (
                          <li key={s} className="flex">
                            <button
                              type="button"
                              onClick={() => setSheetSemester(sheetSemester === s ? null : s)}
                              className={cn(
                                "w-full min-h-[52px] cursor-pointer select-none rounded-md py-5 text-center text-ds-body-16-r leading-ds-body-16-r touch-manipulation",
                                sheetSemester === s
                                  ? "bg-primary/10 font-semibold text-ds-gray-90"
                                  : "text-ds-gray-90"
                              )}
                            >
                              {t("signup.complete.semester", { n: s })}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="shrink-0 px-4 pb-12">
                    <button
                      type="button"
                      onClick={confirmYearSemester}
                      disabled={sheetYear == null || sheetSemester == null}
                      className={cn(
                        "min-h-[52px] w-full cursor-pointer select-none rounded-md py-5 text-ds-body-16-sb leading-ds-body-16-sb touch-manipulation",
                        sheetYear != null && sheetSemester != null
                          ? "bg-primary text-primary-foreground"
                          : "bg-(--ds-bg-disabled) text-ds-disabled"
                      )}
                    >
                      {t("signup.complete.submit")}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className={cn(
              "mt-4 h-auto w-full rounded-none py-4 text-ds-body-16-sb leading-ds-body-16-sb",
              canSubmit && !isSubmitting
                ? "bg-primary text-primary-foreground"
                : "bg-(--ds-bg-disabled) text-ds-disabled"
            )}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "처리 중..." : t("signup.complete.submit")}
          </Button>
          {submitError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {submitError}
            </p>
          )}
        </form>
        </div>
      </div>
    </div>
  );
}
