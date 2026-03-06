"use client";

import { RightIcon } from "@/components/icons/header-icons";
import { TransitionLink } from "@/components/layout/transition-link";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useTranslation } from "react-i18next";

/** Figma 1650-16166: 마이페이지 - 약관 및 개인정보 처리 동의 */
const FROM_MY_QUERY = "?from=my";

export default function MyTermsPage() {
  useHeaderBackground("white");
  const { t } = useTranslation();
  const requiredItems = [
    { label: t("my.termsPage.privacy"), href: `/signup/terms/privacy${FROM_MY_QUERY}` },
    { label: t("my.termsPage.privacyPolicy"), href: `/signup/terms/privacy-policy${FROM_MY_QUERY}` },
    { label: t("my.termsPage.service"), href: `/signup/terms/service${FROM_MY_QUERY}` },
    { label: t("my.termsPage.ai"), href: `/signup/terms/ai${FROM_MY_QUERY}` },
  ];
  const optionalItems = [
    { label: t("my.termsPage.marketing"), href: `/signup/terms/marketing${FROM_MY_QUERY}` },
  ];

  return (
    <div className="min-h-full bg-(--ds-gray-0)">
      {/* 필수 항목 */}
      <nav className="bg-white px-4" aria-label={t("my.termsPage.required")}>
        <div className="py-4 text-ds-caption-14-m font-medium text-ds-tertiary tracking-[-0.35px]">
          {t("my.termsPage.required")}
        </div>
        {requiredItems.map((item) => (
          <TransitionLink
            key={item.label}
            href={item.href}
            className="flex items-center justify-between py-4 text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:opacity-70"
          >
            <span>{item.label}</span>
            <RightIcon className="shrink-0 text-ds-tertiary" aria-hidden />
          </TransitionLink>
        ))}
      </nav>

      <div className="h-2 w-full bg-(--ds-gray-10)" aria-hidden />

      {/* 선택 항목 */}
      <nav className="bg-white px-4" aria-label={t("my.termsPage.optional")}>
        <div className="py-4 text-ds-caption-14-m font-medium text-ds-tertiary tracking-[-0.35px]">
          {t("my.termsPage.optional")}
        </div>
        {optionalItems.map((item) => (
          <TransitionLink
            key={item.label}
            href={item.href}
            className="flex items-center justify-between py-4 text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:opacity-70"
          >
            <span>{item.label}</span>
            <RightIcon className="shrink-0 text-ds-tertiary" aria-hidden />
          </TransitionLink>
        ))}
      </nav>
    </div>
  );
}
