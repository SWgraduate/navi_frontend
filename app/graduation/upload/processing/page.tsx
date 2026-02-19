"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import {
  getGraduationResult,
  setGraduationResult,
  getDefaultCredits,
  MAJOR_TYPE,
  type MajorType,
} from "@/lib/mock-accounts";
import { withViewTransition } from "@/lib/view-transition";

/** Figma 1212-11608: 졸업사정조회 이미지 인식 중 페이지 */
/** Figma 1229-15538: 졸업사정조회 결과 확인 페이지 */
/** Figma 1229-18755: 이미지 없이 현황만 수정하는 화면 */

function GraduationProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("image");
  
  // 전공 타입 파싱 및 검증
  const getMajorType = (): MajorType => {
    const type = searchParams.get("type");
    if (type === MAJOR_TYPE.BASIC || type === MAJOR_TYPE.DOUBLE || type === MAJOR_TYPE.MICRO) {
      return type;
    }
    // 개발용: 기본값 변경하여 테스트 가능
    // BASIC: 제1전공만, DOUBLE: 제1전공+제2전공, MICRO: 제1전공+마이크로
    return MAJOR_TYPE.DOUBLE; // 기본값 (여기를 MAJOR_TYPE.BASIC 또는 MAJOR_TYPE.MICRO로 변경 가능)
  };
  const majorType = getMajorType();
  const savedResult = getGraduationResult();
  const isEditMode = !imageUrl;
  
  // 수정 모드인데 저장된 데이터가 없으면 업로드 페이지로 리다이렉트
  useEffect(() => {
    if (isEditMode && !savedResult) {
      router.push("/graduation/upload");
    }
  }, [isEditMode, savedResult, router]);
  
  const effectiveMajorType: MajorType = isEditMode && savedResult ? savedResult.type : majorType;

  const [progress, setProgress] = useState(() => (!imageUrl ? 100 : 0));
  const [isComplete, setIsComplete] = useState(() => !imageUrl);
  const [credits, setCredits] = useState(() => {
    if (!imageUrl && savedResult) {
      return { ...savedResult.credits };
    }
    return getDefaultCredits();
  });

  // 현재 focus된 입력 필드 추적
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // 입력 검증 에러 메시지
  const [validationError, setValidationError] = useState<string | null>(null);

  // 취득(잔여) 값에서 숫자 추출 함수
  const extractNumber = (value: string): number | null => {
    if (!value || value.trim() === "") return null;
    // 괄호 앞의 숫자 추출 (예: "95(45)" -> 95)
    const match = value.match(/^(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  };

  // 이수 여부 계산 함수 (취득 >= 배당 또는 배당이 없으면 Y)
  const calculateCompletion = (creditValue: string, allocation: string | number): "Y" | "N" => {
    // 배당이 없거나 빈 값이면 Y
    if (!allocation || allocation === "" || allocation === 0) return "Y";
    
    // Y/N 값 처리: 취득과 배당이 모두 Y이면 Y
    if (creditValue === "Y" && allocation === "Y") return "Y";
    if (creditValue === "N" || (allocation === "Y" && creditValue !== "Y")) return "N";
    
    // 숫자 값 처리
    const creditNum = extractNumber(creditValue);
    if (creditNum === null) return "N";
    
    const allocationNum = typeof allocation === "string" ? parseFloat(allocation) : allocation;
    if (isNaN(allocationNum)) return "Y";
    
    return creditNum >= allocationNum ? "Y" : "N";
  };

  // 숫자 입력 검증: - 금지, 0 미만·배당 초과 불가
  const handleNumericChange = (
    rawValue: string,
    allocation: string | number,
    fieldKey: keyof typeof credits
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
    const allocNum =
      typeof allocation === "string"
        ? allocation === ""
          ? null
          : parseFloat(allocation)
        : allocation;
    // 졸업평점은 배당이 최소 요건이므로 상한 검사 제외
    if (
      fieldKey !== "graduationGpa" &&
      allocNum !== null &&
      !isNaN(allocNum) &&
      num > allocNum
    )
      return;
    setCredits((prev) => ({ ...prev, [fieldKey]: filtered }));
  };

  // Y/N 입력: Y, N만 허용 (1글자)
  const handleYnChange = (rawValue: string, fieldKey: keyof typeof credits) => {
    const filtered = rawValue.replace(/[^YyNn]/g, "").toUpperCase().slice(0, 1);
    setCredits((prev) => ({ ...prev, [fieldKey]: filtered }));
  };

  // 졸업평점 입력: 숫자와 . 만 허용, 소수점 하나만
  const handleGpaChange = (rawValue: string, allocation: string | number) => {
    // 숫자와 . 만 허용
    let filtered = rawValue.replace(/[^0-9.]/g, "");
    // 소수점이 하나만 있도록 제한
    const dotIndex = filtered.indexOf(".");
    if (dotIndex !== -1) {
      filtered = filtered.slice(0, dotIndex + 1) + filtered.slice(dotIndex + 1).replace(/\./g, "");
    }
    if (filtered === "") {
      setCredits((prev) => ({ ...prev, graduationGpa: filtered }));
      return;
    }
    const num = parseFloat(filtered);
    if (isNaN(num) || num < 0) return;
    const allocNum =
      typeof allocation === "string" ? parseFloat(allocation) : allocation;
    if (!isNaN(allocNum) && num > allocNum) return;
    setCredits((prev) => ({ ...prev, graduationGpa: filtered }));
  };

  // 배당 값 가져오기 함수 (타입에 따라 다른 값 반환)
  const getAllocation = (fieldKey: keyof typeof credits): string | number => {
    if (effectiveMajorType === MAJOR_TYPE.BASIC || effectiveMajorType === MAJOR_TYPE.MICRO) {
      const basicMicroAllocations: Record<string, string | number> = {
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
      return basicMicroAllocations[fieldKey] ?? "";
    }
    
    // DOUBLE일 때 기본값
    const doubleAllocations: Record<string, string | number> = {
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
    return doubleAllocations[fieldKey] ?? "";
  };

  // 입력 필드 색상 계산 함수
  const getInputTextColor = (fieldKey: string, creditValue: string, allocation: string | number): string => {
    // 입력 중일 때는 tertiary
    if (focusedField === fieldKey) {
      return "text-ds-tertiary";
    }
    // 이수가 Y면 secondary, N이면 brand
    return calculateCompletion(creditValue, allocation) === "Y" ? "text-ds-secondary" : "text-ds-brand";
  };

  // 필드명과 한글 이름 매핑
  const fieldNameMap: Record<keyof typeof credits, string> = {
    enrollment: "재학(졸업직전) 및 수업연한 충족",
    graduation: "졸업학점",
    major: "전공학점",
    coreMajor: "전공핵심",
    advancedMajor: "전공심화",
    industryCooperation: "산학협력영역",
    generalElective: "교양선택",
    secondMajor: "제2전공 전공학점",
    secondCoreMajor: "제2전공 전공핵심",
    secondPrerequisite: "제2전공 선수강이수여부",
    secondUncompleted: "제2전공 미필과목이수여부",
    prerequisite: "선수강이수여부",
    uncompleted: "미필과목이수여부",
    thesis: "졸업논문/시험/작품",
    englishOnly: "영어전용강좌수",
    graduationGpa: "졸업평점",
    socialService: "사회봉사",
    pbl: "PBL강좌수",
    majorIcPbl: "전공IC-PBL강좌수",
    microMajor: "마이크로전공 이수여부",
  };

  // 입력 검증 함수
  const validateInputs = (): boolean => {
    const emptyFields: string[] = [];
    
    // 타입에 따라 필요한 필드만 검증
    const requiredFields: (keyof typeof credits)[] = [
      "graduation",
      "major",
      "coreMajor",
      "advancedMajor",
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

    if (effectiveMajorType === MAJOR_TYPE.MICRO) {
      requiredFields.push("enrollment", "microMajor");
    }
    if (effectiveMajorType === MAJOR_TYPE.DOUBLE) {
      requiredFields.push("secondMajor", "secondCoreMajor", "secondPrerequisite", "secondUncompleted");
    }

    requiredFields.forEach((key) => {
      const value = credits[key];
      if (!value || value.trim() === "") {
        emptyFields.push(fieldNameMap[key]);
      }
    });

    if (emptyFields.length > 0) {
      setValidationError(`${emptyFields.join(", ")}을(를) 입력해주세요.`);
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  useEffect(() => {
    if (!imageUrl && !isEditMode) {
      router.replace("/graduation/upload");
      return;
    }
  }, [imageUrl, isEditMode, router]);

  useEffect(() => {
    if (!imageUrl) return;
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
  }, [imageUrl]);

  // 100% 완료 후 결과 화면 (이미지 있음) 또는 수정 모드 (이미지 없음, 현황만)
  if (isComplete) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div
          className={
            imageUrl
              ? "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
              : "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 pt-4 pb-4"
          }
        >
          {imageUrl && (
            <>
              <div className="relative overflow-hidden bg-black" style={{ height: "35vh", minHeight: "250px" }}>
                <div className="relative z-0 flex h-full w-full items-center justify-center p-4">
                  <div className="relative w-full max-w-sm">
                    <Image
                      src={imageUrl}
                      alt="졸업사정조회 스크린샷"
                      width={800}
                      height={1200}
                      className="w-full h-auto max-h-[1200px] object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="flex min-h-0 flex-1 flex-col px-4 pt-6 pb-4">
                <p className="text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary">
                  인식한 내용이 일치하는지 확인해주세요
                </p>
              </div>
            </>
          )}

          {/* 테이블 영역 (이미지 있을 땐 아래부터, 수정 모드일 땐 상단부터) */}
          <div className={imageUrl ? "px-4 pt-6" : "flex min-h-0 flex-1 flex-col"}>
          {/* 주전공(제1전공) 학점 현황 */}
          <div className="shrink-0">
            <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
              주전공(제1전공) 학점 현황
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#EEEFF1] bg-white">
              <div>
                <table className="graduation-table w-full border-collapse border-spacing-0" style={{ borderSpacing: 0 }}>
                  <thead>
                    <tr className="border-b border-[#EEEFF1] bg-(--ds-gray-5)">
                      <th className="text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px", width: "40%" }}>
                        이수명
                      </th>
                      <th className="py-1 text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", width: "16%" }}>
                        배당
                      </th>
                      <th className="py-1 text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", width: "96px", minWidth: "96px" }}>
                        취득(잔여)
                      </th>
                      <th className="py-1 text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", width: "14%" }}>
                        이수
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-ds-body-16-r leading-ds-body-16-r text-ds-secondary">
                    {/* 제1전공 + 마이크로전공일 때만 재학(졸업직전) 및 수업연한 충족 표시 */}
                    {effectiveMajorType === MAJOR_TYPE.MICRO && (() => {
                      const allocation = getAllocation("enrollment");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>재학(졸업직전) 및 수업연한 충족</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="text"
                              value={credits.enrollment}
                              onChange={(e) => handleYnChange(e.target.value, "enrollment")}
                              onFocus={() => setFocusedField("enrollment")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("enrollment", credits.enrollment, allocation)}`}
                              style={{ width: "90px", minWidth: "90px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.enrollment, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("graduation");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>졸업학점</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={credits.graduation}
                              onChange={(e) => handleNumericChange(e.target.value, "180", "graduation")}
                              onFocus={() => setFocusedField("graduation")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("graduation", credits.graduation, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.graduation, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("major");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>전공학점</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={credits.major}
                              onChange={(e) => handleNumericChange(e.target.value, "150", "major")}
                              onFocus={() => setFocusedField("major")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("major", credits.major, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.major, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("coreMajor");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>전공핵심</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={credits.coreMajor}
                              onChange={(e) => handleNumericChange(e.target.value, "150", "coreMajor")}
                              onFocus={() => setFocusedField("coreMajor")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("coreMajor", credits.coreMajor, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.coreMajor, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("advancedMajor");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>전공심화</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation || ""}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={credits.advancedMajor}
                              onChange={(e) => handleNumericChange(e.target.value, "150", "advancedMajor")}
                              onFocus={() => setFocusedField("advancedMajor")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("advancedMajor", credits.advancedMajor, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.advancedMajor, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("industryCooperation");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>산학협력영역</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={credits.industryCooperation}
                              onChange={(e) => handleNumericChange(e.target.value, "50", "industryCooperation")}
                              onFocus={() => setFocusedField("industryCooperation")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("industryCooperation", credits.industryCooperation, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.industryCooperation, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("generalElective");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>교양선택</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={credits.generalElective}
                              onChange={(e) => handleNumericChange(e.target.value, "50", "generalElective")}
                              onFocus={() => setFocusedField("generalElective")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("generalElective", credits.generalElective, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.generalElective, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {/* 제1전공 + 마이크로전공일 때만 마이크로전공 이수여부 표시 */}
                    {effectiveMajorType === MAJOR_TYPE.MICRO && (() => {
                      const allocation = getAllocation("microMajor");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>마이크로전공 이수여부</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="text"
                              value={credits.microMajor}
                              onChange={(e) => handleYnChange(e.target.value, "microMajor")}
                              onFocus={() => setFocusedField("microMajor")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("microMajor", credits.microMajor, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.microMajor, allocation)}</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 제2전공 현황 - 제1전공 + 복수전공(제2전공)일 때만 표시 */}
          {effectiveMajorType === MAJOR_TYPE.DOUBLE && (
          <div className="mt-6 shrink-0">
            <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
              제2전공 현황
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#EEEFF1] bg-white">
              <div>
                <table className="graduation-table w-full border-collapse border-spacing-0" style={{ borderSpacing: 0 }}>
                  <thead>
                    <tr className="border-b border-[#EEEFF1] bg-(--ds-gray-5)">
                      <th className="text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px", width: "40%" }}>
                        이수명
                      </th>
                      <th className="py-1 text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", width: "16%" }}>
                        배당
                      </th>
                      <th className="py-1 text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", width: "96px", minWidth: "96px" }}>
                        취득(잔여)
                      </th>
                      <th className="py-1 text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", width: "14%" }}>
                        이수
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-ds-body-16-r leading-ds-body-16-r text-ds-secondary">
                    <tr className="border-b border-[#EEEFF1]">
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>전공학점</td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>36</td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={credits.secondMajor}
                          onChange={(e) => handleNumericChange(e.target.value, "180", "secondMajor")}
                          onFocus={() => setFocusedField("secondMajor")}
                          onBlur={() => setFocusedField(null)}
                          className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("secondMajor", credits.secondMajor, "36")}`}
                          style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                        />
                      </td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.secondMajor, "36")}</td>
                    </tr>
                    <tr className="border-b border-[#EEEFF1]">
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>전공핵심</td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>18</td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={credits.secondCoreMajor}
                          onChange={(e) => handleNumericChange(e.target.value, "180", "secondCoreMajor")}
                          onFocus={() => setFocusedField("secondCoreMajor")}
                          onBlur={() => setFocusedField(null)}
                          className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("secondCoreMajor", credits.secondCoreMajor, "18")}`}
                          style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                        />
                      </td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.secondCoreMajor, "18")}</td>
                    </tr>
                    <tr className="border-b border-[#EEEFF1]">
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>선수강이수여부</td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>Y</td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                        <input
                          type="text"
                          inputMode="text"
                          value={credits.secondPrerequisite}
                          onChange={(e) => handleYnChange(e.target.value, "secondPrerequisite")}
                          onFocus={() => setFocusedField("secondPrerequisite")}
                          onBlur={() => setFocusedField(null)}
                          className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("secondPrerequisite", credits.secondPrerequisite, "Y")}`}
                          style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                        />
                      </td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.secondPrerequisite, "Y")}</td>
                    </tr>
                    <tr className="border-b border-[#EEEFF1]">
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>미필과목이수여부</td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>Y</td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                        <input
                          type="text"
                          inputMode="text"
                          value={credits.secondUncompleted}
                          onChange={(e) => handleYnChange(e.target.value, "secondUncompleted")}
                          onFocus={() => setFocusedField("secondUncompleted")}
                          onBlur={() => setFocusedField(null)}
                          className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("secondUncompleted", credits.secondUncompleted, "Y")}`}
                          style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                        />
                      </td>
                      <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.secondUncompleted, "Y")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}

          {/* 필수 요건 */}
          <div className="mt-6 shrink-0">
            <h2 className="mb-3 break-keep text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
              필수 요건
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#EEEFF1] bg-white">
              <div>
                <table className="graduation-table w-full border-collapse border-spacing-0" style={{ borderSpacing: 0 }}>
                  <thead>
                    <tr className="border-b border-[#EEEFF1] bg-(--ds-gray-5)">
                      <th className="text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px", width: "40%" }}>
                        이수명
                      </th>
                      <th className="py-1 text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", width: "16%" }}>
                        배당
                      </th>
                      <th className="py-1 text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", width: "96px", minWidth: "96px" }}>
                        취득(잔여)
                      </th>
                      <th className="py-1 text-center text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary" style={{ paddingLeft: "2px", paddingRight: "2px", width: "14%" }}>
                        이수
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-ds-body-16-r leading-ds-body-16-r text-ds-secondary">
                    {(() => {
                      const allocation = getAllocation("prerequisite");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>선수강이수여부</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="text"
                              value={credits.prerequisite}
                              onChange={(e) => handleYnChange(e.target.value, "prerequisite")}
                              onFocus={() => setFocusedField("prerequisite")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("prerequisite", credits.prerequisite, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.prerequisite, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("uncompleted");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>미필과목이수여부</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="text"
                              value={credits.uncompleted}
                              onChange={(e) => handleYnChange(e.target.value, "uncompleted")}
                              onFocus={() => setFocusedField("uncompleted")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("uncompleted", credits.uncompleted, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.uncompleted, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("thesis");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>졸업논문/시험/작품</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="text"
                              value={credits.thesis}
                              onChange={(e) => handleYnChange(e.target.value, "thesis")}
                              onFocus={() => setFocusedField("thesis")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("thesis", credits.thesis, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.thesis, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("englishOnly");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>영어전용강좌수</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={credits.englishOnly}
                              onChange={(e) => handleNumericChange(e.target.value, "10", "englishOnly")}
                              onFocus={() => setFocusedField("englishOnly")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("englishOnly", credits.englishOnly, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.englishOnly, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("graduationGpa");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>졸업평점</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="text"
                              value={credits.graduationGpa}
                              onChange={(e) => handleGpaChange(e.target.value, "4.5")}
                              onFocus={() => setFocusedField("graduationGpa")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("graduationGpa", credits.graduationGpa, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.graduationGpa, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("socialService");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>사회봉사</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={credits.socialService}
                              onChange={(e) => handleNumericChange(e.target.value, "10", "socialService")}
                              onFocus={() => setFocusedField("socialService")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("socialService", credits.socialService, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.socialService, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("pbl");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>PBL강좌수</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={credits.pbl}
                              onChange={(e) => handleNumericChange(e.target.value, "50", "pbl")}
                              onFocus={() => setFocusedField("pbl")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("pbl", credits.pbl, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.pbl, allocation)}</td>
                        </tr>
                      );
                    })()}
                    {(() => {
                      const allocation = getAllocation("majorIcPbl");
                      return (
                        <tr className="border-b border-[#EEEFF1]">
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>전공IC-PBL강좌수</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{allocation}</td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={credits.majorIcPbl}
                              onChange={(e) => handleNumericChange(e.target.value, "50", "majorIcPbl")}
                              onFocus={() => setFocusedField("majorIcPbl")}
                              onBlur={() => setFocusedField(null)}
                              className={`credits-input rounded-sm px-2 py-1 text-center border-0 outline-none focus:outline-none ${getInputTextColor("majorIcPbl", credits.majorIcPbl, allocation)}`}
                              style={{ width: "84px", minWidth: "84px", backgroundColor: "#e6f0fe", paddingTop: "4px", paddingBottom: "4px", boxSizing: "border-box", lineHeight: "24px", margin: 0, verticalAlign: "middle" }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingLeft: "2px", paddingRight: "2px", paddingTop: "8px", paddingBottom: "8px" }}>{calculateCompletion(credits.majorIcPbl, allocation)}</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
        </div>

        {imageUrl && (
          <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            {validationError && (
              <div className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-center">
                <p className="text-ds-body-14-r leading-ds-body-14-r text-red-600">
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
              일치 확인
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 처리 중 화면
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* 검은 배경 영역 - 업로드된 이미지 */}
      <div className="relative overflow-hidden bg-black" style={{ height: "65vh", minHeight: "400px" }}>
        {/* 업로드된 이미지 */}
        <div className="relative z-0 flex h-full w-full items-center justify-center p-4">
          <div className="relative w-full max-w-sm">
            <Image
              src={imageUrl as string}
              alt="졸업사정조회 스크린샷"
              width={800}
              height={1200}
              className="w-full h-auto max-h-[1200px] object-contain"
            />
          </div>
        </div>
        
        {/* 파란색 그라디언트 애니메이션 - 이미지 위에 오버레이 */}
        <div
          className="absolute inset-0 z-10 animate-gradient-move pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(6, 107, 249, 0) 0%,
              rgba(6, 107, 249, 0.4) 30%,
              rgba(6, 107, 249, 0.7) 50%,
              rgba(6, 107, 249, 0.4) 70%,
              rgba(6, 107, 249, 0) 100%)`,
            height: "200%",
            width: "100%",
            opacity: 0.5,
          }}
        />
      </div>

      {/* 하단 진행률 표시 */}
      <div className="shrink-0 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        <div className="flex items-center justify-center gap-2">
          <span className="text-ds-body-16-r leading-ds-body-16-r font-semibold text-ds-brand">
            {progress}%
          </span>
          <span className="text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
            이미지 인식중...
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GraduationProcessingPage() {
  useHeaderBackground("white");
  return (
    <Suspense fallback={
      <div className="flex h-full min-h-0 flex-col items-center justify-center bg-white">
        <div className="text-ds-body-16-r text-ds-tertiary">로딩 중...</div>
      </div>
    }>
      <GraduationProcessingContent />
    </Suspense>
  );
}
