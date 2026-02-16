"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";
import { ChevronDown, Search } from "lucide-react";

const BUTTON_AREA_HEIGHT = 80;

const MAJOR_OPTIONS = [
  "ICT융합학부",
  "ICT융합학부 디자인테크놀로지",
  "ICT융합학부 미디어테크놀로지",
  "ICT융합학부 컬처테크놀로지",
  "컴퓨터융합학부",
  "인공지능학부",
  "수리데이터사이언스학과",
  "경영학과",
] as const;

type AcademicStatus = "enrolled" | "leave";

/** Figma 6/6: 회원가입 - 학적 정보 입력 */
export default function SignupCompletePage() {
  const router = useRouter();
  useHeaderBackground("white");
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [studentId, setStudentId] = useState("");
  const [major, setMajor] = useState("");
  const [secondMajorType, setSecondMajorType] = useState("");
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus>("enrolled");
  const [yearSemester, setYearSemester] = useState("");
  const [majorSheetOpen, setMajorSheetOpen] = useState(false);
  const [majorSearch, setMajorSearch] = useState("");

  const filteredMajors = useMemo(() => {
    if (!majorSearch.trim()) return MAJOR_OPTIONS;
    const q = majorSearch.trim().toLowerCase();
    return MAJOR_OPTIONS.filter((m) => m.toLowerCase().includes(q));
  }, [majorSearch]);

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
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 transition-[padding-bottom] duration-250 ease-out"
        style={{
          paddingBottom: effectiveKeyboardInset > 0
            ? `calc(${BUTTON_AREA_HEIGHT}px + ${effectiveKeyboardInset}px + var(--safe-area-inset-bottom, 0px) + 8px)`
            : "calc(112px + var(--safe-area-inset-bottom, 0px) + 8px)",
        }}
      >
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
              <ChevronDown className="absolute right-3 h-5 w-5 shrink-0 text-ds-tertiary" aria-hidden />
            </button>
          </div>

          {/* 주전공 선택 바텀시트 (Figma 1105-11744) */}
          {majorSheetOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/40"
                aria-hidden
                onClick={() => setMajorSheetOpen(false)}
              />
              <div
                className="fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col rounded-t-xl bg-white shadow-lg"
                role="dialog"
                aria-modal="true"
                aria-labelledby="major-sheet-title"
              >
                <div className="flex shrink-0 flex-col gap-3 p-4">
                  <div className="mx-auto h-1 w-10 rounded-full bg-ds-gray-20" aria-hidden />
                  <h2 id="major-sheet-title" className="text-center text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
                    주전공을 선택해주세요
                  </h2>
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
                <ul className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
                  {filteredMajors.map((m) => (
                    <li key={m}>
                      <button
                        type="button"
                        onClick={() => {
                          setMajor(m);
                          setMajorSheetOpen(false);
                          setMajorSearch("");
                        }}
                        className="w-full py-3 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:bg-ds-gray-10"
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
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-second-major"
              className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
            >
              제2전공 유형
            </label>
            <div className="relative flex items-center rounded-md border-2 border-transparent bg-secondary focus-within:border-primary">
              <select
                id="signup-second-major"
                value={secondMajorType}
                onChange={(e) => setSecondMajorType(e.target.value)}
                className="w-full appearance-none rounded-md bg-transparent p-4 pr-10 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 focus:outline-none focus:ring-0 scheme-light"
              >
                <option value="">제2전공 유형을 선택해주세요</option>
                <option value="minor">부전공</option>
                <option value="double">복수전공</option>
                <option value="none">해당 없음</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-5 w-5 shrink-0 text-ds-tertiary" aria-hidden />
            </div>
          </div>

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
              htmlFor="signup-year-semester"
              className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
            >
              현재 이수한 학년/학기 <span className="text-destructive">*</span>
            </label>
            <div className="relative flex items-center rounded-md border-2 border-transparent bg-secondary focus-within:border-primary">
              <select
                id="signup-year-semester"
                value={yearSemester}
                onChange={(e) => setYearSemester(e.target.value)}
                className="w-full appearance-none rounded-md bg-transparent p-4 pr-10 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 focus:outline-none focus:ring-0 scheme-light"
              >
                <option value="">학년/학기를 선택해주세요</option>
                <option value="1-1">1학년 1학기</option>
                <option value="1-2">1학년 2학기</option>
                <option value="2-1">2학년 1학기</option>
                <option value="2-2">2학년 2학기</option>
                <option value="3-1">3학년 1학기</option>
                <option value="3-2">3학년 2학기</option>
                <option value="4-1">4학년 1학기</option>
                <option value="4-2">4학년 2학기</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-5 w-5 shrink-0 text-ds-tertiary" aria-hidden />
            </div>
          </div>
        </form>
      </div>

      <div
        className="fixed left-0 right-0 z-10 bg-white pt-8 pb-8 transition-[bottom] duration-250 ease-out"
        style={{
          bottom: effectiveKeyboardInset > 0
            ? `${effectiveKeyboardInset}px`
            : "calc(32px + var(--safe-area-inset-bottom, 0px))",
          paddingBottom: "8px",
          maxWidth: "var(--app-max-width)",
          margin: "0 auto",
        }}
      >
        <Button
          type="submit"
          form="signup-complete-form"
          variant="primary"
          size="lg"
          className={cn(
            "h-auto w-full rounded-none py-4 text-ds-body-16-sb leading-ds-body-16-sb",
            canSubmit
              ? "bg-primary text-primary-foreground"
              : "bg-[#EEEFF1] text-ds-disabled"
          )}
          disabled={!canSubmit}
        >
          완료
        </Button>
      </div>
    </div>
  );
}
