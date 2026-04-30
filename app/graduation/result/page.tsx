"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import {
  MAJOR_TYPE,
  type MajorType,
  type CreditKey,
  type Credits,
} from "@/lib/types/graduation";
import {
  getMyAcademicRecord,
  getMyProfile,
  type AcademicRecordResponse,
} from "@/lib/api/student";
import { getGraduationRequirements, type GraduationRequirements } from "@/lib/api/major";
import { withViewTransition } from "@/lib/view-transition";
import { useTranslation } from "react-i18next";

function mapAcademicRecordToCredits(record: AcademicRecordResponse): Credits {
  const { earnedCredits, secondMajorCredits, completedConditions } = record;
  return {
    enrollment: "",
    graduation: String(earnedCredits.total),
    major: String(earnedCredits.majorTotal),
    coreMajor: String(earnedCredits.majorCore),
    advancedMajor: String(earnedCredits.majorAdvanced),
    industryCooperation: String(earnedCredits.industry),
    generalElective: String(earnedCredits.generalElective),
    secondMajor: String(secondMajorCredits.majorTotal),
    secondCoreMajor: String(secondMajorCredits.majorCore),
    secondPrerequisite: "",
    secondUncompleted: "",
    prerequisite: completedConditions.hasPrerequisite ? "Y" : "N",
    uncompleted: completedConditions.hasMandatoryCourse ? "Y" : "N",
    thesis: completedConditions.hasThesis ? "Y" : "N",
    englishOnly: String(completedConditions.englishCourses),
    graduationGpa: String(earnedCredits.gpa),
    socialService: String(earnedCredits.socialService),
    pbl: String(completedConditions.pblTotal),
    majorIcPbl: String(completedConditions.pblMajor),
    microMajor: "",
  };
}

function getMajorTypeFromSecondMajorType(secondMajorType: string): MajorType {
  if (secondMajorType === "마이크로전공") return MAJOR_TYPE.MICRO;
  if (!secondMajorType || secondMajorType === "없음" || secondMajorType === "부전공") return MAJOR_TYPE.BASIC;
  return MAJOR_TYPE.DOUBLE;
}

const SKIP_SAVED_RESULT_KEY = "navi_skip_saved_graduation_result_once";

function extractNumber(value: string): number | null {
  if (!value || value.trim() === "") return null;
  const match = value.match(/^(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function calculateCompletion(creditValue: string, allocation: string | number): "Y" | "N" {
  if (!allocation || allocation === "" || allocation === 0) return "Y";
  if (creditValue === "Y" && allocation === "Y") return "Y";
  if (creditValue === "N" || (allocation === "Y" && creditValue !== "Y")) return "N";
  const creditNum = extractNumber(creditValue);
  if (creditNum === null) return "N";
  const allocationNum = typeof allocation === "string" ? parseFloat(allocation) : allocation;
  if (isNaN(allocationNum)) return "Y";
  return creditNum >= allocationNum ? "Y" : "N";
}

function buildAllocationMap(
  majorType: MajorType,
  req: GraduationRequirements
): Record<string, string | number> {
  const { requiredCredits: rc, requiredConditions: cond, requiredSecondMajorCredits: smc } = req;
  const base: Record<string, string | number> = {
    graduation: rc.total,
    major: rc.majorTotal,
    coreMajor: rc.majorCore,
    advancedMajor: rc.majorAdvanced,
    industryCooperation: rc.industry,
    generalElective: rc.generalElective,
    socialService: rc.socialService,
    graduationGpa: String(rc.gpa),
    englishOnly: cond.englishCourses,
    pbl: cond.pblTotal,
    majorIcPbl: cond.pblMajor,
    prerequisite: cond.hasPrerequisite ? "Y" : "",
    uncompleted: cond.hasMandatoryCourse ? "Y" : "",
    thesis: cond.hasThesis ? "Y" : "",
    enrollment: "Y",
    microMajor: "Y",
  };
  if (majorType === MAJOR_TYPE.DOUBLE && smc) {
    base.secondMajor = smc.majorTotal;
    base.secondCoreMajor = smc.majorCore;
    base.secondPrerequisite = "Y";
    base.secondUncompleted = "Y";
  }
  return base;
}

function getAllocation(
  majorType: MajorType,
  fieldKey: CreditKey,
  allocationMap?: Record<string, string | number>
): string | number {
  if (allocationMap) return allocationMap[fieldKey] ?? "";

  // 폴백: API 응답 없을 때 기존 하드코드 값 사용
  if (majorType === MAJOR_TYPE.BASIC || majorType === MAJOR_TYPE.MICRO) {
    const map: Record<string, string | number> = {
      graduation: 140, major: 75, coreMajor: 36, advancedMajor: 30,
      industryCooperation: 6, generalElective: 10, prerequisite: "Y",
      uncompleted: "Y", thesis: "Y", englishOnly: 2, graduationGpa: "1.75",
      socialService: 1, pbl: 4, majorIcPbl: 1, enrollment: "Y", microMajor: "Y",
    };
    return map[fieldKey] ?? "";
  }
  const map: Record<string, string | number> = {
    graduation: 140, major: 45, coreMajor: 34, advancedMajor: "",
    industryCooperation: 6, generalElective: 10, prerequisite: "Y",
    uncompleted: "Y", thesis: "Y", englishOnly: 2, graduationGpa: "1.25",
    socialService: 1, pbl: 4, majorIcPbl: 1,
    secondMajor: 36, secondCoreMajor: 18, secondPrerequisite: "Y", secondUncompleted: "Y",
  };
  return map[fieldKey] ?? "";
}

const CELL_STYLE = {
  padding: "8px 2px",
  textAlign: "center" as const,
};

/** 졸업사정조회 결과 페이지: API에서 학적 데이터 조회 */
export default function GraduationResultPage() {
  const router = useRouter();
  useHeaderBackground("white");
  const { t } = useTranslation();
  const rowLabel = (key: CreditKey) => t(`graduation.resultRows.${key}`);

  const [majorType, setMajorType] = useState<MajorType>(MAJOR_TYPE.BASIC);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [allocationMap, setAllocationMap] = useState<Record<string, string | number> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyAcademicRecord(), getMyProfile()])
      .then(([record, profile]) => {
        if ("id" in record) {
          setCredits(mapAcademicRecordToCredits(record as AcademicRecordResponse));
        }
        if ("secondMajorType" in profile) {
          const mType = getMajorTypeFromSecondMajorType(profile.secondMajorType);
          setMajorType(mType);

          const p = profile as import("@/lib/api/student").StudentResponse;
          if (p.major && p.admissionYear) {
            getGraduationRequirements({
              major: p.major,
              admissionYear: p.admissionYear,
              isTransfer: p.isTransfer,
              secondMajorType: p.secondMajorType !== "없음" ? p.secondMajorType : undefined,
            })
              .then((req) => setAllocationMap(buildAllocationMap(mType, req)))
              .catch(() => {
                // API 실패 시 하드코드 폴백 유지
              });
          }
        }
      })
      .catch(() => {
        // 데이터 없음 → 시작 화면으로
        sessionStorage.setItem(SKIP_SAVED_RESULT_KEY, "1");
        router.replace("/graduation");
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    window.history.pushState({ graduationResultGuard: true }, "", window.location.href);

    const handlePopState = () => {
      sessionStorage.setItem(SKIP_SAVED_RESULT_KEY, "1");
      withViewTransition(() => router.replace("/graduation"));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div
          className="rounded-full bg-ds-gray-30 animate-pulse-scale"
          style={{ width: 32, height: 32 }}
        />
      </div>
    );
  }

  if (!credits) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4 py-10">
        <p className="text-center text-ds-body-16-r text-ds-tertiary">
          {t("graduation.result.noResult")}
        </p>
      </div>
    );
  }

  const ga = (key: CreditKey) => getAllocation(majorType, key, allocationMap);

  const renderRow = (
    label: string,
    fieldKey: CreditKey,
    allocation: string | number,
    showRemaining = false
  ) => {
    const value = credits[fieldKey];
    const completion = calculateCompletion(value, allocation);
    const isComplete = completion === "Y";

    let displayValue = value || "-";
    if (showRemaining && value && typeof allocation === "number") {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        const remaining = allocation - num;
        displayValue = `${value}(${remaining})`;
      }
    }

    return (
      <tr key={fieldKey} className="border-b border-[#EEEFF1]">
        <td className="text-ds-body-16-r leading-ds-body-16-r text-ds-secondary" style={CELL_STYLE}>
          {label}
        </td>
        <td className="text-ds-body-16-r leading-ds-body-16-r text-ds-secondary" style={CELL_STYLE}>
          {allocation === "" ? "" : String(allocation)}
        </td>
        <td style={CELL_STYLE}>
          <span
            className={`inline-block rounded-sm px-2 py-1 text-center text-ds-body-16-r leading-ds-body-16-r ${isComplete ? "text-ds-secondary" : "text-ds-brand"}`}
            style={{
              backgroundColor: "#e6f0fe",
              paddingTop: "4px",
              paddingBottom: "4px",
              minWidth: "84px",
              boxSizing: "border-box",
            }}
          >
            {displayValue}
          </span>
        </td>
        <td className="text-ds-body-16-r leading-ds-body-16-r text-ds-secondary" style={CELL_STYLE}>
          {completion}
        </td>
      </tr>
    );
  };

  const thStyle = {
    ...CELL_STYLE,
    width: "40%" as const,
  };
  const thStyleNarrow = { ...CELL_STYLE, width: "16%" as const };
  const thStyleAcquire = { ...CELL_STYLE, width: "96px", minWidth: "96px" };
  const thStyleComplete = { ...CELL_STYLE, width: "14%" as const };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 pt-4 pb-4">
        {/* 주전공(제1전공) 학점 현황 */}
        <div className="shrink-0">
          <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
            {t("graduation.result.major1Title")}
          </h2>
          <div className="overflow-x-auto rounded-lg border border-[#EEEFF1] bg-white">
            <table className="w-full border-collapse border-spacing-0" style={{ borderSpacing: 0 }}>
              <thead>
                <tr className="border-b border-[#EEEFF1] bg-(--ds-gray-5)">
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyle}>
                    {t("graduation.table.courseName")}
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleNarrow}>
                    {t("graduation.table.allocation")}
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleAcquire}>
                    {t("graduation.table.acquired")}
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleComplete}>
                    {t("graduation.table.completion")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {majorType === MAJOR_TYPE.MICRO &&
                  renderRow(rowLabel("enrollment"), "enrollment", ga("enrollment"))}
                {renderRow(rowLabel("graduation"), "graduation", ga("graduation"), true)}
                {renderRow(rowLabel("major"), "major", ga("major"))}
                {renderRow(rowLabel("coreMajor"), "coreMajor", ga("coreMajor"))}
                {renderRow(rowLabel("advancedMajor"), "advancedMajor", ga("advancedMajor"))}
                {renderRow(rowLabel("industryCooperation"), "industryCooperation", ga("industryCooperation"))}
                {renderRow(rowLabel("generalElective"), "generalElective", ga("generalElective"))}
                {majorType === MAJOR_TYPE.MICRO &&
                  renderRow(rowLabel("microMajor"), "microMajor", ga("microMajor"))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 제2전공 현황 */}
        {majorType === MAJOR_TYPE.DOUBLE && (
          <div className="mt-6 shrink-0">
            <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
              {t("graduation.result.major2Title")}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#EEEFF1] bg-white">
              <table className="w-full border-collapse border-spacing-0" style={{ borderSpacing: 0 }}>
                <thead>
                  <tr className="border-b border-[#EEEFF1] bg-(--ds-gray-5)">
                    <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyle}>
                      {t("graduation.table.courseName")}
                    </th>
                    <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleNarrow}>
                      {t("graduation.table.allocation")}
                    </th>
                    <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleAcquire}>
                      {t("graduation.table.acquired")}
                    </th>
                    <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleComplete}>
                      {t("graduation.table.completion")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {renderRow(rowLabel("secondMajor"), "secondMajor", ga("secondMajor"))}
                  {renderRow(rowLabel("secondCoreMajor"), "secondCoreMajor", ga("secondCoreMajor"))}
                  {renderRow(rowLabel("secondPrerequisite"), "secondPrerequisite", ga("secondPrerequisite"))}
                  {renderRow(rowLabel("secondUncompleted"), "secondUncompleted", ga("secondUncompleted"))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 필수 요건 */}
        <div className="mt-6 shrink-0">
          <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
            {t("graduation.result.requiredTitle")}
          </h2>
          <div className="overflow-x-auto rounded-lg border border-[#EEEFF1] bg-white">
            <table className="w-full border-collapse border-spacing-0" style={{ borderSpacing: 0 }}>
              <thead>
                <tr className="border-b border-[#EEEFF1] bg-(--ds-gray-5)">
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyle}>
                    {t("graduation.table.courseName")}
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleNarrow}>
                    {t("graduation.table.allocation")}
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleAcquire}>
                    {t("graduation.table.acquired")}
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleComplete}>
                    {t("graduation.table.completion")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {renderRow(rowLabel("prerequisite"), "prerequisite", ga("prerequisite"))}
                {renderRow(rowLabel("uncompleted"), "uncompleted", ga("uncompleted"))}
                {renderRow(rowLabel("thesis"), "thesis", ga("thesis"))}
                {renderRow(rowLabel("englishOnly"), "englishOnly", ga("englishOnly"))}
                {renderRow(rowLabel("graduationGpa"), "graduationGpa", ga("graduationGpa"))}
                {renderRow(rowLabel("socialService"), "socialService", ga("socialService"))}
                {renderRow(rowLabel("pbl"), "pbl", ga("pbl"))}
                {renderRow(rowLabel("majorIcPbl"), "majorIcPbl", ga("majorIcPbl"))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
