"use client";

import { RightIcon } from "@/components/icons/header-icons";
import { TransitionLink } from "@/components/layout/transition-link";
import { useHeaderBackground } from "@/hooks/use-header-background";

/** Figma 1650-16166: 마이페이지 - 약관 및 개인정보 처리 동의 */
const FROM_MY_QUERY = "?from=my";

const REQUIRED_ITEMS: Array<{ label: string; href: string }> = [
  { label: "개인정보 수집 및 이용 동의", href: `/signup/terms/privacy${FROM_MY_QUERY}` },
  { label: "NAVI 개인정보 처리방침", href: `/signup/terms/privacy-policy${FROM_MY_QUERY}` },
  { label: "서비스 이용약관 동의", href: `/signup/terms/service${FROM_MY_QUERY}` },
  { label: "AI 서비스 결과 면책 동의", href: `/signup/terms/ai${FROM_MY_QUERY}` },
];

const OPTIONAL_ITEMS: Array<{ label: string; href: string }> = [
  { label: "마케팅 정보 수신 동의", href: `/signup/terms/marketing${FROM_MY_QUERY}` },
];

export default function MyTermsPage() {
  useHeaderBackground("white");

  return (
    <div className="min-h-full bg-(--ds-gray-0)">
      {/* 필수 항목 */}
      <nav className="bg-white px-4" aria-label="필수 약관">
        <div className="py-4 text-ds-caption-14-m font-medium text-ds-tertiary tracking-[-0.35px]">
          필수 항목
        </div>
        {REQUIRED_ITEMS.map((item) => (
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
      <nav className="bg-white px-4" aria-label="선택 약관">
        <div className="py-4 text-ds-caption-14-m font-medium text-ds-tertiary tracking-[-0.35px]">
          선택 항목
        </div>
        {OPTIONAL_ITEMS.map((item) => (
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
