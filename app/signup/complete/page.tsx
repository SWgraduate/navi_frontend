"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";
import { Search } from "lucide-react";

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

const sheetPanelVariants = {
  open: { y: 0 },
  closed: { y: "100%" },
};

const MAJOR_OPTIONS = [
  "ICT융합학부",
  "ICT융합학부 디자인테크놀로지",
  "ICT융합학부 미디어테크놀로지",
  "ICT융합학부 컬처테크놀로지",
  "컴퓨터학부",
  "인공지능학부",
  "수리데이터사이언스학과",
  "경영학과",
] as const;

const SECOND_MAJOR_OPTIONS = [
  "다중전공",
  "융합전공",
  "부전공",
  "복수전공",
  "연계전공",
  "마이크로전공",
] as const;

type AcademicStatus = "enrolled" | "leave";

/** Figma 6/6: 회원가입 - 학적 정보 입력 */
export default function SignupCompletePage() {
  const router = useRouter();
  useHeaderBackground("white");

  const [studentId, setStudentId] = useState("");
  const [major, setMajor] = useState("");
  const [secondMajorType, setSecondMajorType] = useState("");
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus | "">("");
  const [yearSemester, setYearSemester] = useState("");
  const [majorSheetOpen, setMajorSheetOpen] = useState(false);
  const [majorSearch, setMajorSearch] = useState("");
  const [secondMajorSheetOpen, setSecondMajorSheetOpen] = useState(false);
  const [secondMajor, setSecondMajor] = useState("");
  const [secondMajorPickerOpen, setSecondMajorPickerOpen] = useState(false);
  const [secondMajorPickerSearch, setSecondMajorPickerSearch] = useState("");
  const [yearSemesterSheetOpen, setYearSemesterSheetOpen] = useState(false);
  const [sheetYear, setSheetYear] = useState<number | null>(null);
  const [sheetSemester, setSheetSemester] = useState<number | null>(null);

  const majorSheetDragControls = useDragControls();
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
    }
    setYearSemesterSheetOpen(false);
  };

  const yearSemesterDisplay =
    yearSemester && yearSemester.includes("-")
      ? (() => {
          const [y, s] = yearSemester.split("-").map(Number);
          return `${y}학년 ${s}학기`;
        })()
      : "";

  const filteredMajors = useMemo(() => {
    if (!majorSearch.trim()) return MAJOR_OPTIONS;
    const q = majorSearch.trim().toLowerCase();
    return MAJOR_OPTIONS.filter((m) => m.toLowerCase().includes(q));
  }, [majorSearch]);

  const filteredSecondMajors = useMemo(() => {
    if (!secondMajorPickerSearch.trim()) return MAJOR_OPTIONS;
    const q = secondMajorPickerSearch.trim().toLowerCase();
    return MAJOR_OPTIONS.filter((m) => m.toLowerCase().includes(q));
  }, [secondMajorPickerSearch]);

  const canSubmit =
    studentId.trim().length > 0 &&
    major.length > 0 &&
    academicStatus.length > 0 &&
    yearSemester.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: 회원가입 API (학적 정보 저장)
    withViewTransition(() => router.push("/home"));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4 pb-8"
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
            졸업까지 얼마나 남으셨나요?
          </h1>
          <p className="text-ds-body-16-r leading-ds-body-16-r text-ds-tertiary">
            졸업사정조회를 위해 현재 학적 정보를 알려주세요
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
              학번 <span className="text-destructive">*</span>
            </label>
            <input
              id="signup-student-id"
              type="text"
              inputMode="numeric"
              placeholder="학번을 입력해주세요 (예: 2026000000)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="rounded-md border-2 border-transparent bg-secondary p-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:border-primary focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-major-trigger"
              className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
            >
              주전공 <span className="text-destructive">*</span>
            </label>
            <button
              id="signup-major-trigger"
              type="button"
              onClick={() => setMajorSheetOpen(true)}
              className="relative flex w-full items-center justify-between rounded-md border-2 border-transparent bg-secondary p-4 pr-10 text-left text-ds-body-16-r leading-ds-body-16-r focus:border-primary focus:outline-none focus:ring-0"
            >
              <span className={cn(major ? "text-ds-gray-90" : "text-ds-tertiary")}>
                {major || "전공을 선택해주세요"}
              </span>
              <UpDownIcon className="absolute right-3 h-6 w-6 shrink-0 text-ds-tertiary" />
            </button>
          </div>

          {/* 주전공 선택 바텀시트 (Figma 1105-11744) */}
          <AnimatePresence>
            {majorSheetOpen && (
              <>
                <motion.div
                  className="fixed inset-0 z-40 bg-black/40"
                  aria-hidden
                  onClick={() => setMajorSheetOpen(false)}
                  variants={sheetOverlayVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] h-fit flex-col rounded-t-xl bg-white shadow-lg"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="major-sheet-title"
                  variants={sheetPanelVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ bottom: 0.25 }}
                  dragListener={false}
                  dragControls={majorSheetDragControls}
                  onDragEnd={(e, info) => handleSheetDragEnd(e, info, () => setMajorSheetOpen(false))}
                >
                <div className="flex shrink-0 flex-col gap-2 px-4 pt-2">
                  <div
                    className="flex min-h-[56px] cursor-grab active:cursor-grabbing flex-col items-center justify-center gap-2 py-2 touch-manipulation"
                    aria-hidden
                    onPointerDown={(e) => majorSheetDragControls.start(e)}
                  >
                    <div className="h-1.5 w-12 rounded-full bg-[#EEEFF1]" />
                    <h2 id="major-sheet-title" className="text-center text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary pointer-events-none">
                      주전공을 선택해주세요
                    </h2>
                  </div>
                  <div className="relative flex items-center rounded-md border-2 border-transparent bg-secondary focus-within:border-primary">
                    <Search className="absolute left-3 h-5 w-5 shrink-0 text-ds-tertiary" aria-hidden />
                    <input
                      type="search"
                      placeholder="전공을 검색하세요"
                      value={majorSearch}
                      onChange={(e) => setMajorSearch(e.target.value)}
                      className="w-full rounded-md bg-transparent py-3 pl-10 pr-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>
                <ul className="overflow-y-auto px-4 max-h-[60vh] touch-manipulation">
                  {filteredMajors.map((m) => (
                    <li key={m}>
                      <button
                        type="button"
                        onClick={() => {
                          setMajor(m);
                          setMajorSheetOpen(false);
                          setMajorSearch("");
                        }}
                        className="w-full min-h-[56px] py-4 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:bg-ds-gray-10 touch-manipulation"
                      >
                        {m}
                      </button>
                    </li>
                  ))}
                  {filteredMajors.length === 0 && (
                    <li className="py-4 text-center text-ds-caption-14-r text-ds-tertiary">
                      검색 결과가 없습니다
                    </li>
                  )}
                </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-second-major-trigger"
              className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
            >
              제2전공 유형
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
              <span>{secondMajorType || "제2전공 유형을 선택해주세요"}</span>
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
                  className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] h-fit flex-col rounded-t-xl bg-white shadow-lg"
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
                    className="flex min-h-[56px] cursor-grab active:cursor-grabbing flex-col items-center justify-center gap-2 py-2 touch-manipulation"
                    aria-hidden
                    onPointerDown={(e) => secondMajorTypeDragControls.start(e)}
                  >
                    <div className="h-1.5 w-12 rounded-full bg-[#EEEFF1]" />
                    <h2 id="second-major-sheet-title" className="text-center text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary pointer-events-none">
                      제2전공 유형을 선택해주세요
                    </h2>
                  </div>
                </div>
                <ul className="overflow-y-auto px-4 max-h-[60vh] touch-manipulation">
                  {SECOND_MAJOR_OPTIONS.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        onClick={() => {
                          setSecondMajorType(option);
                          setSecondMajorSheetOpen(false);
                        }}
                        className="w-full min-h-[56px] py-4 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:bg-ds-gray-10 touch-manipulation"
                      >
                        {option}
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
                제2전공
              </label>
              <button
                id="signup-second-major-picker-trigger"
                type="button"
                onClick={() => setSecondMajorPickerOpen(true)}
                className={cn(
                  "relative flex w-full items-center justify-between rounded-md border-2 border-transparent bg-secondary p-4 pr-10 text-left text-ds-body-16-r leading-ds-body-16-r focus:border-primary focus:outline-none focus:ring-0",
                  secondMajor ? "text-ds-gray-90" : "text-ds-tertiary"
                )}
              >
                <span>{secondMajor || "전공을 선택해주세요"}</span>
                <UpDownIcon className="absolute right-3 h-6 w-6 shrink-0 text-ds-tertiary" />
              </button>
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
                  className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] h-fit flex-col rounded-t-xl bg-white shadow-lg"
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
                      className="flex min-h-[56px] cursor-grab active:cursor-grabbing flex-col items-center justify-center gap-2 py-2 touch-manipulation"
                      aria-hidden
                      onPointerDown={(e) => secondMajorPickerDragControls.start(e)}
                    >
                      <div className="h-1.5 w-12 rounded-full bg-[#EEEFF1]" />
                      <h2 id="second-major-picker-sheet-title" className="text-center text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary pointer-events-none">
                        제2전공을 선택해주세요
                      </h2>
                    </div>
                    <div className="relative flex items-center rounded-md border-2 border-transparent bg-secondary focus-within:border-primary">
                      <Search className="absolute left-3 h-5 w-5 shrink-0 text-ds-tertiary" aria-hidden />
                      <input
                        type="search"
                        placeholder="전공을 검색하세요"
                        value={secondMajorPickerSearch}
                        onChange={(e) => setSecondMajorPickerSearch(e.target.value)}
                        className="w-full rounded-md bg-transparent py-3 pl-10 pr-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>
                  <ul className="overflow-y-auto px-4 max-h-[60vh] touch-manipulation">
                    {filteredSecondMajors.map((m) => (
                      <li key={m}>
                        <button
                          type="button"
                          onClick={() => {
                            setSecondMajor(m);
                            setSecondMajorPickerOpen(false);
                            setSecondMajorPickerSearch("");
                          }}
                          className="w-full min-h-[56px] py-4 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:bg-ds-gray-10 touch-manipulation"
                        >
                          {m}
                        </button>
                      </li>
                    ))}
                    {filteredSecondMajors.length === 0 && (
                      <li className="py-4 text-center text-ds-caption-14-r text-ds-tertiary">
                        검색 결과가 없습니다
                      </li>
                    )}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2">
            <span className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary">
              학적상태 <span className="text-destructive">*</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAcademicStatus("enrolled")}
                className={cn(
                  "flex-1 rounded-md border-2 py-3 text-ds-body-16-r leading-ds-body-16-r",
                  academicStatus === "enrolled"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-secondary text-ds-tertiary"
                )}
              >
                재학생
              </button>
              <button
                type="button"
                onClick={() => setAcademicStatus("leave")}
                className={cn(
                  "flex-1 rounded-md border-2 py-3 text-ds-body-16-r leading-ds-body-16-r",
                  academicStatus === "leave"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-secondary text-ds-tertiary"
                )}
              >
                휴학생
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-year-semester-trigger"
              className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
            >
              현재 이수한 학년/학기 <span className="text-destructive">*</span>
            </label>
            <button
              id="signup-year-semester-trigger"
              type="button"
              onClick={openYearSemesterSheet}
              className={cn(
                "flex w-full items-center rounded-md border-2 border-transparent bg-secondary p-4 text-left text-ds-body-16-r leading-ds-body-16-r focus:border-primary focus:outline-none focus:ring-0",
                yearSemesterDisplay ? "text-ds-gray-90" : "text-ds-tertiary"
              )}
            >
              <span>{yearSemesterDisplay || "학년/학기를 선택해주세요"}</span>
            </button>
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
                  className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] h-fit flex-col rounded-t-xl bg-white shadow-lg"
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
                      className="flex min-h-[56px] cursor-grab active:cursor-grabbing flex-col items-center justify-center gap-2 py-2 touch-manipulation"
                      aria-hidden
                      onPointerDown={(e) => yearSemesterDragControls.start(e)}
                    >
                      <div className="h-1.5 w-12 rounded-full bg-[#EEEFF1]" />
                      <h2 id="year-semester-sheet-title" className="text-center text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary pointer-events-none">
                        학년 / 학기를 선택해주세요
                      </h2>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <ul className="flex flex-col gap-1">
                        {YEAR_OPTIONS.map((y) => (
                          <li key={y}>
                            <button
                              type="button"
                              onClick={() => setSheetYear(y)}
                              className={cn(
                                "w-full min-h-[56px] rounded-md py-4 text-center text-ds-body-16-r leading-ds-body-16-r touch-manipulation",
                                sheetYear === y
                                  ? "bg-primary/10 font-semibold text-ds-gray-90"
                                  : "text-ds-gray-90"
                              )}
                            >
                              {y}학년
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="min-w-0 flex-1">
                      <ul className="flex flex-col gap-1">
                        {SEMESTER_OPTIONS.map((s) => (
                          <li key={s}>
                            <button
                              type="button"
                              onClick={() => setSheetSemester(s)}
                              className={cn(
                                "w-full min-h-[56px] rounded-md py-4 text-center text-ds-body-16-r leading-ds-body-16-r touch-manipulation",
                                sheetSemester === s
                                  ? "bg-primary/10 font-semibold text-ds-gray-90"
                                  : "text-ds-gray-90"
                              )}
                            >
                              {s}학기
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
                        "min-h-[56px] w-full rounded-md py-4 text-ds-body-16-sb leading-ds-body-16-sb touch-manipulation",
                        sheetYear != null && sheetSemester != null
                          ? "bg-primary text-primary-foreground"
                          : "bg-[#EEEFF1] text-ds-disabled"
                      )}
                    >
                      완료
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
              canSubmit
                ? "bg-primary text-primary-foreground"
                : "bg-[#EEEFF1] text-ds-disabled"
            )}
            disabled={!canSubmit}
          >
            완료
          </Button>
        </form>
        </div>
      </div>
    </div>
  );
}
