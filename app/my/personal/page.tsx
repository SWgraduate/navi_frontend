"use client";

import { RightIcon } from "@/components/icons/header-icons";
import { TransitionLink } from "@/components/layout/transition-link";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useProfile } from "@/hooks/use-profile";
import { useTranslation } from "react-i18next";
import {
  getMajorLabel,
  apiAcademicStatusToCode,
  apiSecondMajorTypeToCode,
  completedSemestersToYearSemester,
  type MajorCode,
} from "@/lib/academic-options";
import type { SecondMajorType } from "@/lib/api/student";

/** Figma 1091-6843: 마이페이지 - 개인정보 설정 */
export default function MyPersonalPage() {
  useHeaderBackground("white");
  const { t } = useTranslation();
  const { profile } = useProfile();

  const yearSemesterCode = profile
    ? completedSemestersToYearSemester(profile.completedSemesters)
    : "";
  const [year, semester] = yearSemesterCode ? yearSemesterCode.split("-").map(Number) : [null, null];
  const yearSemesterValue =
    year != null && semester != null
      ? t("my.personal.yearSemesterPage.display", { y: year, s: semester })
      : "";

  const secondMajorCode = profile?.secondMajorType
    ? apiSecondMajorTypeToCode(profile.secondMajorType as SecondMajorType)
    : "";

  const academicStatusCode = profile?.academicStatus
    ? apiAcademicStatusToCode(profile.academicStatus)
    : null;

  const personalItems: Array<{ label: string; value: string; href?: string }> = [
    { label: t("my.personal.name"), value: profile?.name ?? "", href: "/my/personal/name" },
    { label: t("my.personal.studentId"), value: profile?.studentNumber ?? "", href: "/my/personal/student-id" },
    { label: t("my.personal.major"), value: profile ? getMajorLabel(t, profile.major as MajorCode) : "", href: "/my/personal/major" },
    {
      label: t("my.personal.secondMajor"),
      value: secondMajorCode && profile?.secondMajor
        ? getMajorLabel(t, profile.secondMajor as MajorCode)
        : t("common.none"),
      href: "/my/personal/second-major",
    },
    {
      label: t("my.personal.academicStatus"),
      value: academicStatusCode === "leave"
        ? t("my.personal.academicStatusPage.leave")
        : academicStatusCode === "enrolled"
          ? t("my.personal.academicStatusPage.enrolled")
          : "",
      href: "/my/personal/academic-status",
    },
    {
      label: t("my.personal.yearSemester"),
      value: yearSemesterValue,
      href: "/my/personal/year-semester",
    },
    {
      label: t("my.personal.isTransfer"),
      value: profile
        ? (profile.isTransfer ? t("my.personal.transferPage.yes") : t("my.personal.transferPage.no"))
        : "",
      href: "/my/personal/transfer",
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
