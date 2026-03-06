"use client";

import { RightIcon } from "@/components/icons/header-icons";
import { TransitionLink } from "@/components/layout/transition-link";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { MOCK_PERSONAL_INFO } from "@/lib/mock-accounts";
import { useTranslation } from "react-i18next";
import { getMajorLabel } from "@/lib/academic-options";

/** Figma 1091-6843: 마이페이지 - 개인정보 설정 */
export default function MyPersonalPage() {
  useHeaderBackground("white");
  const { t } = useTranslation();
  const [year, semester] = MOCK_PERSONAL_INFO.yearSemester.split("-").map(Number);
  const yearSemesterValue =
    Number.isFinite(year) && Number.isFinite(semester)
      ? t("my.personal.yearSemesterPage.display", { y: year, s: semester })
      : MOCK_PERSONAL_INFO.yearSemester;
  const personalItems: Array<{ label: string; value: string; href?: string }> = [
    { label: t("my.personal.name"), value: MOCK_PERSONAL_INFO.name, href: "/my/personal/name" },
    { label: t("my.personal.studentId"), value: MOCK_PERSONAL_INFO.studentId, href: "/my/personal/student-id" },
    { label: t("my.personal.major"), value: getMajorLabel(t, MOCK_PERSONAL_INFO.major), href: "/my/personal/major" },
    {
      label: t("my.personal.secondMajor"),
      value: MOCK_PERSONAL_INFO.secondMajor ? getMajorLabel(t, MOCK_PERSONAL_INFO.secondMajor) : t("common.none"),
      href: "/my/personal/second-major",
    },
    {
      label: t("my.personal.academicStatus"),
      value:
        MOCK_PERSONAL_INFO.academicStatus === "leave"
          ? t("my.personal.academicStatusPage.leave")
          : t("my.personal.academicStatusPage.enrolled"),
      href: "/my/personal/academic-status",
    },
    {
      label: t("my.personal.yearSemester"),
      value: yearSemesterValue,
      href: "/my/personal/year-semester",
    },
  ];

  return (
    <div className="min-h-full bg-(--ds-gray-0)">
      <nav className="px-4 pt-4" aria-label={t("my.personalInfo")}>
        {personalItems.map((item) => {
          const content = (
            <>
              <span className="text-ds-primary">{item.label}</span>
              <span className="flex items-center gap-2 text-ds-tertiary">
                <span>{item.value}</span>
                <RightIcon className="shrink-0" aria-hidden />
              </span>
            </>
          );

          return item.href ? (
            <TransitionLink
              key={item.label}
              href={item.href}
              className="flex items-center justify-between py-3 text-ds-body-16-r leading-ds-body-16-r active:opacity-70"
            >
              {content}
            </TransitionLink>
          ) : (
            <div
              key={item.label}
              className="flex items-center justify-between py-3 text-ds-body-16-r leading-ds-body-16-r"
              role="listitem"
            >
              {content}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
