"use client";

import { RightIcon } from "@/components/icons/header-icons";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { MOCK_PERSONAL_INFO } from "@/lib/mock-accounts";

/** Figma 1091-6843: 마이페이지 - 개인정보 설정 */
const PERSONAL_ITEMS: Array<{ label: string; value: string }> = [
  { label: "이름", value: MOCK_PERSONAL_INFO.name },
  { label: "학번", value: MOCK_PERSONAL_INFO.studentId },
  { label: "주전공", value: MOCK_PERSONAL_INFO.major },
  { label: "제2전공", value: MOCK_PERSONAL_INFO.secondMajor },
  { label: "학적상태", value: MOCK_PERSONAL_INFO.academicStatus },
  { label: "현재 이수한 학년/학기", value: MOCK_PERSONAL_INFO.yearSemester },
];

export default function MyPersonalPage() {
  useHeaderBackground("white");

  return (
    <div className="min-h-full bg-(--ds-gray-0)">
      <nav className="px-4 pt-4" aria-label="개인정보 목록">
        {PERSONAL_ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-3 text-ds-body-16-r leading-ds-body-16-r"
            role="listitem"
          >
            <span className="text-ds-primary">{item.label}</span>
            <span className="flex items-center gap-2 text-ds-tertiary">
              <span>{item.value}</span>
              <RightIcon className="shrink-0" aria-hidden />
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
