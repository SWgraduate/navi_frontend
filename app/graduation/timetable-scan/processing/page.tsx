"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import {
  getGraduationResult,
  setGraduationResult,
  MAJOR_TYPE,
  type MajorType,
  type Credits as StoredCredits,
  type CreditKey,
} from "@/lib/mock-accounts";
import { withViewTransition } from "@/lib/view-transition";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { AnimatePresence, motion } from "framer-motion";

/** Figma 2163-11231: 최신 시간표 스캔 처리 중 / 업데이트 확인 페이지 */

type Credits = StoredCredits;
type CreditKeyStr = CreditKey;

/** 스캔 후 mock 업데이트 적용 및 변경 목록 생성 */
function applyMockUpdates(
  saved: NonNullable<ReturnType<typeof getGraduationResult>>,
  t: (key: string) => string,
): { updatedCredits: Credits; changes: string[] } {
  const base = { ...saved.credits };
  const changes: string[] = [];

  const extractNum = (v: string) => {
    const m = v.match(/^(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
  };

  const tryAdd = (
    key: CreditKeyStr,
    amount: number,
    labelKey: string,
  ) => {
    const cur = extractNum(base[key]);
    if (cur === null) return;
    const next = cur + amount;
    const old = base[key];
    base[key] = String(next);
    changes.push(
      `${t(`graduation.fields.${labelKey}`)}이 ${old}학점에서 ${next}학점으로 업데이트 되었어요.`,
    );
  };

  const gradNum = extractNum(base.graduation as string);
  if (gradNum !== null && gradNum <= 130) tryAdd("graduation", 5, "graduation");

  const majorNum = extractNum(base.major as string);
  if (majorNum !== null && majorNum <= 40) tryAdd("major", 3, "major");

  return { updatedCredits: base, changes };
}

function TimetableScanProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const imageUrl = searchParams.get("image");
  const savedResult = getGraduationResult();

  useEffect(() => {
    if (!savedResult) {
      router.replace("/graduation/upload");
    }
  }, [savedResult, router]);

  const effectiveMajorType: MajorType =
    savedResult?.type ?? MAJOR_TYPE.DOUBLE;

  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [updateSummaryOpen, setUpdateSummaryOpen] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { updatedCredits, changes } = savedResult
    ? applyMockUpdates(savedResult, t)
    : { updatedCredits: ({} as unknown as Credits), changes: [] };

  const [credits, setCredits] = useState<Credits>(() => updatedCredits);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const rowLabel = (key: CreditKeyStr) =>
    t(`graduation.resultRows.${key}`);

  const extractNumber = (value: string): number | null => {
    if (!value || value.trim() === "") return null;
    const match = value.match(/^(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  };

  const calculateCompletion = (
    creditValue: string,
    allocation: string | number,
  ): "Y" | "N" => {
    if (!allocation || allocation === "" || allocation === 0) return "Y";
    if (creditValue === "Y" && allocation === "Y") return "Y";
    if (
      creditValue === "N" ||
      (allocation === "Y" && creditValue !== "Y")
    )
      return "N";
    const creditNum = extractNumber(creditValue);
    if (creditNum === null) return "N";
    const allocationNum =
      typeof allocation === "string"
        ? parseFloat(allocation)
        : allocation;
    if (isNaN(allocationNum)) return "Y";
    return creditNum >= allocationNum ? "Y" : "N";
  };

  const handleNumericChange = (
    rawValue: string,
    maxStr: string,
    fieldKey: CreditKeyStr,
  ) => {
    const filtered = rawValue.replace(/[^0-9().]/g, "");
    if (filtered === "") {
      setCredits((prev) => ({ ...prev, [fieldKey]: filtered }));
      return;
    }
    const num = extractNumber(filtered);
    if (num === null) {
      setCredits((prev) => ({ ...prev, [fieldKey]: filtered }));
      return;
    }
    if (num < 0) return;
    const max = parseFloat(maxStr);
    if (fieldKey !== "graduationGpa" && !isNaN(max) && num > max) return;
    setCredits((prev) => ({ ...prev, [fieldKey]: filtered }));
  };

  const handleYnChange = (rawValue: string, fieldKey: CreditKeyStr) => {
    const filtered = rawValue
      .replace(/[^YyNn]/g, "")
      .toUpperCase()
      .slice(0, 1);
    setCredits((prev) => ({ ...prev, [fieldKey]: filtered }));
  };

  const handleGpaChange = (rawValue: string) => {
    let filtered = rawValue.replace(/[^0-9.]/g, "");
    const dotIndex = filtered.indexOf(".");
    if (dotIndex !== -1) {
      filtered =
        filtered.slice(0, dotIndex + 1) +
        filtered.slice(dotIndex + 1).replace(/\./g, "");
    }
    if (filtered === "") {
      setCredits((prev) => ({ ...prev, graduationGpa: filtered }));
      return;
    }
    const num = parseFloat(filtered);
    if (isNaN(num) || num < 0 || num > 4.5) return;
    setCredits((prev) => ({ ...prev, graduationGpa: filtered }));
  };

  const getAllocation = (fieldKey: CreditKeyStr): string | number => {
    if (
      effectiveMajorType === MAJOR_TYPE.BASIC ||
      effectiveMajorType === MAJOR_TYPE.MICRO
    ) {
      const map: Record<string, string | number> = {
        graduation: 140,
        major: 75,
        coreMajor: 36,
        advancedMajor: 30,
        industryCooperation: 6,
        generalElective: 10,
        prerequisite: "Y",
        uncompleted: "Y",
        thesis: "Y",
        englishOnly: 2,
        graduationGpa: "1.75",
        socialService: 1,
        pbl: 4,
        majorIcPbl: 1,
        enrollment: "Y",
        microMajor: "Y",
      };
      return map[fieldKey] ?? "";
    }
    const map: Record<string, string | number> = {
      graduation: 140,
      major: 45,
      coreMajor: 34,
      advancedMajor: "",
      industryCooperation: 6,
      generalElective: 10,
      prerequisite: "Y",
      uncompleted: "Y",
      thesis: "Y",
      englishOnly: 2,
      graduationGpa: "1.25",
      socialService: 1,
      pbl: 4,
      majorIcPbl: 1,
    };
    return map[fieldKey] ?? "";
  };

  const getInputColor = (
    fieldKey: string,
    creditValue: string,
    allocation: string | number,
  ) => {
    if (focusedField === fieldKey) return "text-ds-tertiary";
    return calculateCompletion(creditValue, allocation) === "Y"
      ? "text-ds-secondary"
      : "text-ds-brand";
  };

  const inputStyle = {
    width: "84px",
    minWidth: "84px",
    backgroundColor: "#e6f0fe",
    paddingTop: "4px",
    paddingBottom: "4px",
    boxSizing: "border-box" as const,
    lineHeight: "24px",
    margin: 0,
    verticalAlign: "middle",
  };

  const tdStyle = {
    paddingLeft: "2px",
    paddingRight: "2px",
    paddingTop: "8px",
    paddingBottom: "8px",
  };

  const validateInputs = (): boolean => {
    const required: CreditKeyStr[] = [
      "graduation",
      "major",
      "coreMajor",
      "industryCooperation",
      "generalElective",
      "prerequisite",
      "uncompleted",
      "thesis",
      "englishOnly",
      "graduationGpa",
      "socialService",
      "pbl",
      "majorIcPbl",
    ];
    if (effectiveMajorType === MAJOR_TYPE.DOUBLE) {
      required.push(
        "secondMajor",
        "secondCoreMajor",
        "secondPrerequisite",
        "secondUncompleted",
      );
    }
    const empty = required.filter((k) => !credits[k] || credits[k].trim() === "");
    if (empty.length > 0) {
      setValidationError(
        t("graduation.processing.validationError", {
          fields: empty
            .map((k) => t(`graduation.fields.${k}`))
            .join(", "),
        }),
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  const TABLE_HEADER = (
    <tr className="border-b border-[#EEEFF1] bg-(--ds-gray-5)">
      <th
        className="text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
        style={{ ...tdStyle, width: "40%" }}
      >
        {t("graduation.table.courseName")}
      </th>
      <th
        className="text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
        style={{ ...tdStyle, width: "16%" }}
      >
        {t("graduation.table.allocation")}
      </th>
      <th
        className="text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
        style={{ ...tdStyle, width: "96px", minWidth: "96px" }}
      >
        {t("graduation.table.acquired")}
      </th>
      <th
        className="text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
        style={{ ...tdStyle, width: "14%" }}
      >
        {t("graduation.table.completion")}
      </th>
    </tr>
  );

  const renderNumericRow = (
    key: CreditKeyStr,
    maxStr: string,
    last = false,
  ) => {
    const allocation = getAllocation(key);
    const value = credits[key];
    return (
      <tr key={key} className={last ? "" : "border-b border-[#EEEFF1]"}>
        <td className="text-center" style={tdStyle}>
          {rowLabel(key)}
        </td>
        <td className="text-center" style={tdStyle}>
          {allocation}
        </td>
        <td className="text-center" style={tdStyle}>
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => handleNumericChange(e.target.value, maxStr, key)}
            onFocus={() => setFocusedField(key)}
            onBlur={() => setFocusedField(null)}
            className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputColor(key, value, allocation)}`}
            style={inputStyle}
          />
        </td>
        <td className="text-center" style={tdStyle}>
          {calculateCompletion(value, allocation)}
        </td>
      </tr>
    );
  };

  const renderYnRow = (key: CreditKeyStr, last = false) => {
    const allocation = getAllocation(key);
    const value = credits[key];
    return (
      <tr key={key} className={last ? "" : "border-b border-[#EEEFF1]"}>
        <td className="text-center" style={tdStyle}>
          {rowLabel(key)}
        </td>
        <td className="text-center" style={tdStyle}>
          {allocation}
        </td>
        <td className="text-center" style={tdStyle}>
          <input
            type="text"
            inputMode="text"
            value={value}
            onChange={(e) => handleYnChange(e.target.value, key)}
            onFocus={() => setFocusedField(key)}
            onBlur={() => setFocusedField(null)}
            className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputColor(key, value, allocation)}`}
            style={inputStyle}
          />
        </td>
        <td className="text-center" style={tdStyle}>
          {calculateCompletion(value, allocation)}
        </td>
      </tr>
    );
  };

  /* ── 스캔 중 화면 ── */
  if (!isComplete) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div
          className="relative overflow-hidden bg-black"
          style={{ height: "65vh", minHeight: "400px" }}
        >
          <div className="relative z-0 flex h-full w-full items-center justify-center p-4">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={t("graduation.timetableScan.altUploaded", { index: 1 })}
                width={800}
                height={1200}
                className="h-auto w-full max-h-[1200px] object-contain"
                unoptimized
              />
            ) : (
              <Image
                src="/example/example_timetable.png"
                alt={t("graduation.timetableScan.altExample")}
                width={800}
                height={800}
                className="h-auto w-full object-contain"
              />
            )}
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-10 animate-gradient-move"
            style={{
              background: `linear-gradient(to bottom,
                rgba(6,107,249,0) 0%,
                rgba(6,107,249,0.4) 30%,
                rgba(6,107,249,0.7) 50%,
                rgba(6,107,249,0.4) 70%,
                rgba(6,107,249,0) 100%)`,
              height: "200%",
              opacity: 0.5,
            }}
          />
        </div>
        <div className="shrink-0 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
          <div className="flex items-center justify-center gap-2">
            <span className="text-ds-body-16-r leading-ds-body-16-r font-semibold text-ds-brand">
              {progress}%
            </span>
            <span className="text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
              {t("graduation.processing.scanning")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ── 확인 화면 ── */
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* 시간표 이미지 */}
        <div
          className="relative overflow-hidden bg-black"
          style={{ height: "35vh", minHeight: "220px" }}
        >
          <div className="flex h-full w-full items-center justify-center p-4">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={t("graduation.timetableScan.altUploaded", { index: 1 })}
                width={800}
                height={1200}
                className="h-auto w-full max-h-[1200px] object-contain"
                unoptimized
              />
            ) : (
              <Image
                src="/example/example_timetable.png"
                alt={t("graduation.timetableScan.altExample")}
                width={800}
                height={800}
                className="h-auto w-full object-contain"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-4 pb-4">
          {/* 업데이트된 내용 확인하기 패널 */}
          {changes.length > 0 && (
            <div className="rounded-lg bg-[#F4F4F6] px-4 py-3">
              <button
                type="button"
                className="flex w-full items-center justify-between"
                onClick={() => setUpdateSummaryOpen((o) => !o)}
              >
                <span className="text-ds-caption-14-r leading-ds-caption-14-r text-ds-secondary">
                  {t("graduation.timetableScan.updateSummaryTitle")}
                </span>
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="shrink-0 text-ds-secondary"
                  animate={{ rotate: updateSummaryOpen ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </button>
              <AnimatePresence initial={false}>
                {updateSummaryOpen && (
                  <motion.div
                    key="summary"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="my-2 h-px bg-[#EEEFF1]" />
                    <div className="flex flex-col gap-1 pb-1">
                      {changes.map((c, i) => (
                        <p
                          key={i}
                          className="text-ds-caption-14-r leading-ds-caption-14-r text-ds-secondary"
                        >
                          {c}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 확인 안내 문구 */}
          <p className="text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary">
            {t("graduation.processing.confirmMessage")}
          </p>

          {/* 주전공(제1전공) 학점 현황 */}
          <div>
            <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
              {t("graduation.processing.major1Title")}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#EEEFF1]">
              <table
                className="graduation-table w-full border-collapse"
                style={{ borderSpacing: 0 }}
              >
                <thead>{TABLE_HEADER}</thead>
                <tbody className="text-ds-body-16-r leading-ds-body-16-r text-ds-secondary">
                  {effectiveMajorType === MAJOR_TYPE.MICRO &&
                    renderYnRow("enrollment")}
                  {renderNumericRow("graduation", "180")}
                  {renderNumericRow("major", "150")}
                  {renderNumericRow("coreMajor", "150")}
                  {renderNumericRow("advancedMajor", "150")}
                  {renderNumericRow("industryCooperation", "50")}
                  {renderNumericRow(
                    "generalElective",
                    "50",
                    effectiveMajorType !== MAJOR_TYPE.MICRO,
                  )}
                  {effectiveMajorType === MAJOR_TYPE.MICRO &&
                    renderYnRow("microMajor", true)}
                </tbody>
              </table>
            </div>
          </div>

          {/* 제2전공 현황 */}
          {effectiveMajorType === MAJOR_TYPE.DOUBLE && (
            <div>
              <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
                {t("graduation.processing.major2Title")}
              </h2>
              <div className="overflow-x-auto rounded-lg border border-[#EEEFF1]">
                <table
                  className="graduation-table w-full border-collapse"
                  style={{ borderSpacing: 0 }}
                >
                  <thead>{TABLE_HEADER}</thead>
                  <tbody className="text-ds-body-16-r leading-ds-body-16-r text-ds-secondary">
                    <tr className="border-b border-[#EEEFF1]">
                      <td className="text-center" style={tdStyle}>
                        {rowLabel("secondMajor")}
                      </td>
                      <td className="text-center" style={tdStyle}>
                        36
                      </td>
                      <td className="text-center" style={tdStyle}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={credits.secondMajor}
                          onChange={(e) =>
                            handleNumericChange(
                              e.target.value,
                              "180",
                              "secondMajor",
                            )
                          }
                          onFocus={() => setFocusedField("secondMajor")}
                          onBlur={() => setFocusedField(null)}
                          className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputColor("secondMajor", credits.secondMajor, "36")}`}
                          style={inputStyle}
                        />
                      </td>
                      <td className="text-center" style={tdStyle}>
                        {calculateCompletion(credits.secondMajor, "36")}
                      </td>
                    </tr>
                    <tr className="border-b border-[#EEEFF1]">
                      <td className="text-center" style={tdStyle}>
                        {rowLabel("secondCoreMajor")}
                      </td>
                      <td className="text-center" style={tdStyle}>
                        18
                      </td>
                      <td className="text-center" style={tdStyle}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={credits.secondCoreMajor}
                          onChange={(e) =>
                            handleNumericChange(
                              e.target.value,
                              "180",
                              "secondCoreMajor",
                            )
                          }
                          onFocus={() => setFocusedField("secondCoreMajor")}
                          onBlur={() => setFocusedField(null)}
                          className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputColor("secondCoreMajor", credits.secondCoreMajor, "18")}`}
                          style={inputStyle}
                        />
                      </td>
                      <td className="text-center" style={tdStyle}>
                        {calculateCompletion(credits.secondCoreMajor, "18")}
                      </td>
                    </tr>
                    <tr className="border-b border-[#EEEFF1]">
                      <td className="text-center" style={tdStyle}>
                        {rowLabel("secondPrerequisite")}
                      </td>
                      <td className="text-center" style={tdStyle}>
                        Y
                      </td>
                      <td className="text-center" style={tdStyle}>
                        <input
                          type="text"
                          inputMode="text"
                          value={credits.secondPrerequisite}
                          onChange={(e) =>
                            handleYnChange(e.target.value, "secondPrerequisite")
                          }
                          onFocus={() => setFocusedField("secondPrerequisite")}
                          onBlur={() => setFocusedField(null)}
                          className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputColor("secondPrerequisite", credits.secondPrerequisite, "Y")}`}
                          style={inputStyle}
                        />
                      </td>
                      <td className="text-center" style={tdStyle}>
                        {calculateCompletion(credits.secondPrerequisite, "Y")}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-center" style={tdStyle}>
                        {rowLabel("secondUncompleted")}
                      </td>
                      <td className="text-center" style={tdStyle}>
                        Y
                      </td>
                      <td className="text-center" style={tdStyle}>
                        <input
                          type="text"
                          inputMode="text"
                          value={credits.secondUncompleted}
                          onChange={(e) =>
                            handleYnChange(e.target.value, "secondUncompleted")
                          }
                          onFocus={() => setFocusedField("secondUncompleted")}
                          onBlur={() => setFocusedField(null)}
                          className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputColor("secondUncompleted", credits.secondUncompleted, "Y")}`}
                          style={inputStyle}
                        />
                      </td>
                      <td className="text-center" style={tdStyle}>
                        {calculateCompletion(credits.secondUncompleted, "Y")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 필수 요건 */}
          <div>
            <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
              {t("graduation.processing.requiredTitle")}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#EEEFF1]">
              <table
                className="graduation-table w-full border-collapse"
                style={{ borderSpacing: 0 }}
              >
                <thead>{TABLE_HEADER}</thead>
                <tbody className="text-ds-body-16-r leading-ds-body-16-r text-ds-secondary">
                  {renderYnRow("prerequisite")}
                  {renderYnRow("uncompleted")}
                  {renderYnRow("thesis")}
                  {renderNumericRow("englishOnly", "10")}
                  <tr className="border-b border-[#EEEFF1]">
                    <td className="text-center" style={tdStyle}>
                      {rowLabel("graduationGpa")}
                    </td>
                    <td className="text-center" style={tdStyle}>
                      {getAllocation("graduationGpa")}
                    </td>
                    <td className="text-center" style={tdStyle}>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={credits.graduationGpa}
                        onChange={(e) => handleGpaChange(e.target.value)}
                        onFocus={() => setFocusedField("graduationGpa")}
                        onBlur={() => setFocusedField(null)}
                        className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputColor("graduationGpa", credits.graduationGpa, getAllocation("graduationGpa"))}`}
                        style={inputStyle}
                      />
                    </td>
                    <td className="text-center" style={tdStyle}>
                      {calculateCompletion(
                        credits.graduationGpa,
                        getAllocation("graduationGpa"),
                      )}
                    </td>
                  </tr>
                  {renderNumericRow("socialService", "10")}
                  {renderNumericRow("pbl", "50")}
                  {renderNumericRow("majorIcPbl", "50", true)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 확인 버튼 */}
      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        {validationError && (
          <div className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-center">
            <p className="text-ds-caption-14-r text-red-600">
              {validationError}
            </p>
          </div>
        )}
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full text-white"
          onClick={() => {
            if (validateInputs()) {
              setGraduationResult({ type: effectiveMajorType, credits });
              withViewTransition(() => router.push("/graduation/result"));
            }
          }}
        >
          {t("graduation.processing.confirmCta")}
        </Button>
      </div>
    </div>
  );
}

export default function TimetableScanProcessingPage() {
  useHeaderBackground("white");
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-0 flex-col items-center justify-center bg-white">
          <div className="text-ds-body-16-r text-ds-tertiary">
            {t("common.loading")}
          </div>
        </div>
      }
    >
      <TimetableScanProcessingContent />
    </Suspense>
  );
}
