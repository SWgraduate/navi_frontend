"use client";

import { useHeaderBackground } from "@/hooks/use-header-background";
import {
  getGraduationResult,
  MAJOR_TYPE,
  type MajorType,
  type CreditKey,
  type Credits,
} from "@/lib/mock-accounts";
import { useTranslation } from "react-i18next";

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

function getAllocation(majorType: MajorType, fieldKey: CreditKey): string | number {
  if (majorType === MAJOR_TYPE.BASIC || majorType === MAJOR_TYPE.MICRO) {
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
    secondMajor: 36,
    secondCoreMajor: 18,
    secondPrerequisite: "Y",
    secondUncompleted: "Y",
  };
  return map[fieldKey] ?? "";
}

const CELL_STYLE = {
  padding: "8px 2px",
  textAlign: "center" as const,
};

/** 졸업사정조회 결과 페이지: Navi 사용자 데이터 표시 (로컬스토리지에서 조회) */
export default function GraduationResultPage() {
  useHeaderBackground("white");
  const { t } = useTranslation();
  const saved = getGraduationResult();
  const rowLabel = (key: CreditKey) => t(`graduation.resultRows.${key}`);
  
  if (!saved) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4 py-10">
        <p className="text-center text-ds-body-16-r text-ds-tertiary">
          {t("graduation.result.noResult")}
        </p>
      </div>
    );
  }
  
  const majorType: MajorType = saved.type;
  const credits: Credits = saved.credits;

  const renderRow = (
    label: string,
    fieldKey: CreditKey,
    allocation: string | number
  ) => {
    const value = credits[fieldKey];
    const completion = calculateCompletion(value, allocation);
    const isComplete = completion === "Y";
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
            {value || "-"}
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
                  renderRow(rowLabel("enrollment"), "enrollment", getAllocation(majorType, "enrollment"))}
                {renderRow(rowLabel("graduation"), "graduation", getAllocation(majorType, "graduation"))}
                {renderRow(rowLabel("major"), "major", getAllocation(majorType, "major"))}
                {renderRow(rowLabel("coreMajor"), "coreMajor", getAllocation(majorType, "coreMajor"))}
                {renderRow(rowLabel("advancedMajor"), "advancedMajor", getAllocation(majorType, "advancedMajor"))}
                {renderRow(rowLabel("industryCooperation"), "industryCooperation", getAllocation(majorType, "industryCooperation"))}
                {renderRow(rowLabel("generalElective"), "generalElective", getAllocation(majorType, "generalElective"))}
                {majorType === MAJOR_TYPE.MICRO &&
                  renderRow(rowLabel("microMajor"), "microMajor", getAllocation(majorType, "microMajor"))}
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
                  {renderRow(rowLabel("secondMajor"), "secondMajor", getAllocation(majorType, "secondMajor"))}
                  {renderRow(rowLabel("secondCoreMajor"), "secondCoreMajor", getAllocation(majorType, "secondCoreMajor"))}
                  {renderRow(rowLabel("secondPrerequisite"), "secondPrerequisite", getAllocation(majorType, "secondPrerequisite"))}
                  {renderRow(rowLabel("secondUncompleted"), "secondUncompleted", getAllocation(majorType, "secondUncompleted"))}
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
                {renderRow(rowLabel("prerequisite"), "prerequisite", getAllocation(majorType, "prerequisite"))}
                {renderRow(rowLabel("uncompleted"), "uncompleted", getAllocation(majorType, "uncompleted"))}
                {renderRow(rowLabel("thesis"), "thesis", getAllocation(majorType, "thesis"))}
                {renderRow(rowLabel("englishOnly"), "englishOnly", getAllocation(majorType, "englishOnly"))}
                {renderRow(rowLabel("graduationGpa"), "graduationGpa", getAllocation(majorType, "graduationGpa"))}
                {renderRow(rowLabel("socialService"), "socialService", getAllocation(majorType, "socialService"))}
                {renderRow(rowLabel("pbl"), "pbl", getAllocation(majorType, "pbl"))}
                {renderRow(rowLabel("majorIcPbl"), "majorIcPbl", getAllocation(majorType, "majorIcPbl"))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
