"use client";

import { useHeaderBackground } from "@/hooks/use-header-background";
import {
  getGraduationResult,
  MAJOR_TYPE,
  type MajorType,
  type CreditKey,
  type Credits,
} from "@/lib/mock-accounts";

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
  const saved = getGraduationResult();
  
  if (!saved) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4 py-10">
        <p className="text-center text-ds-body-16-r text-ds-tertiary">
          저장된 졸업사정조회 결과가 없습니다.
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
            주전공(제1전공) 학점 현황
          </h2>
          <div className="overflow-x-auto rounded-lg border border-[#EEEFF1] bg-white">
            <table className="w-full border-collapse border-spacing-0" style={{ borderSpacing: 0 }}>
              <thead>
                <tr className="border-b border-[#EEEFF1] bg-(--ds-gray-5)">
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyle}>
                    이수명
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleNarrow}>
                    배당
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleAcquire}>
                    취득(잔여)
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleComplete}>
                    이수
                  </th>
                </tr>
              </thead>
              <tbody>
                {majorType === MAJOR_TYPE.MICRO &&
                  renderRow("재학(졸업직전) 및 수업연한 충족", "enrollment", getAllocation(majorType, "enrollment"))}
                {renderRow("졸업학점", "graduation", getAllocation(majorType, "graduation"))}
                {renderRow("전공학점", "major", getAllocation(majorType, "major"))}
                {renderRow("전공핵심", "coreMajor", getAllocation(majorType, "coreMajor"))}
                {renderRow("전공심화", "advancedMajor", getAllocation(majorType, "advancedMajor"))}
                {renderRow("산학협력영역", "industryCooperation", getAllocation(majorType, "industryCooperation"))}
                {renderRow("교양선택", "generalElective", getAllocation(majorType, "generalElective"))}
                {majorType === MAJOR_TYPE.MICRO &&
                  renderRow("마이크로전공 이수여부", "microMajor", getAllocation(majorType, "microMajor"))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 제2전공 현황 */}
        {majorType === MAJOR_TYPE.DOUBLE && (
          <div className="mt-6 shrink-0">
            <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
              제2전공 현황
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#EEEFF1] bg-white">
              <table className="w-full border-collapse border-spacing-0" style={{ borderSpacing: 0 }}>
                <thead>
                  <tr className="border-b border-[#EEEFF1] bg-(--ds-gray-5)">
                    <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyle}>
                      이수명
                    </th>
                    <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleNarrow}>
                      배당
                    </th>
                    <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleAcquire}>
                      취득(잔여)
                    </th>
                    <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleComplete}>
                      이수
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {renderRow("전공학점", "secondMajor", getAllocation(majorType, "secondMajor"))}
                  {renderRow("전공핵심", "secondCoreMajor", getAllocation(majorType, "secondCoreMajor"))}
                  {renderRow("선수강이수여부", "secondPrerequisite", getAllocation(majorType, "secondPrerequisite"))}
                  {renderRow("미필과목이수여부", "secondUncompleted", getAllocation(majorType, "secondUncompleted"))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 필수 요건 */}
        <div className="mt-6 shrink-0">
          <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
            필수 요건
          </h2>
          <div className="overflow-x-auto rounded-lg border border-[#EEEFF1] bg-white">
            <table className="w-full border-collapse border-spacing-0" style={{ borderSpacing: 0 }}>
              <thead>
                <tr className="border-b border-[#EEEFF1] bg-(--ds-gray-5)">
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyle}>
                    이수명
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleNarrow}>
                    배당
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleAcquire}>
                    취득(잔여)
                  </th>
                  <th className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={thStyleComplete}>
                    이수
                  </th>
                </tr>
              </thead>
              <tbody>
                {renderRow("선수강이수여부", "prerequisite", getAllocation(majorType, "prerequisite"))}
                {renderRow("미필과목이수여부", "uncompleted", getAllocation(majorType, "uncompleted"))}
                {renderRow("졸업논문/시험/작품", "thesis", getAllocation(majorType, "thesis"))}
                {renderRow("영어전용강좌수", "englishOnly", getAllocation(majorType, "englishOnly"))}
                {renderRow("졸업평점", "graduationGpa", getAllocation(majorType, "graduationGpa"))}
                {renderRow("사회봉사", "socialService", getAllocation(majorType, "socialService"))}
                {renderRow("PBL강좌수", "pbl", getAllocation(majorType, "pbl"))}
                {renderRow("전공IC-PBL강좌수", "majorIcPbl", getAllocation(majorType, "majorIcPbl"))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
