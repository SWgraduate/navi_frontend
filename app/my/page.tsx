"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* 목데이터 – API 연동 시 제거 후 실제 데이터로 교체 */
const MOCK_USER = {
  name: "Navi",
  email: "aaaaaa@hanyang.ac.kr",
} as const;

const MOCK_SETTING_ITEMS: Array<{
  label: string;
  href: string;
  rightLabel?: string;
}> = [
  { label: "개인정보 설정", href: "/my/personal" },
  { label: "언어설정", href: "/my/language", rightLabel: "한국어(KR)" },
];

const MOCK_VERSION = "1.00";

/** Figma 1086-8553 마이페이지 */
export default function MyPage() {
  return (
    <div className="bg-(--ds-bg-default)">
      {/* 사용자 정보 */}
      <section className="px-4 pb-16">
        <p className="font-semibold text-ds-display leading-ds-display text-(--ds-text-bolder)">
          {MOCK_USER.name}님
          <br />
          안녕하세요!
        </p>
        <p className="mt-1 text-ds-body leading-ds text-(--ds-text-subtle)">
          {MOCK_USER.email}
        </p>
      </section>
      <div className="h-2 w-full bg-(--ds-gray-10)" aria-hidden />

      {/* 설정 메뉴 */}
      <nav className="px-4" aria-label="설정 메뉴">
        {MOCK_SETTING_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between py-3 text-ds-body text-(--ds-text-bolder) active:opacity-70"
          >
            <span>{item.label}</span>
            <span className="flex items-center gap-1">
              {item.rightLabel != null && (
                <span className="text-(--ds-text-subtle)">{item.rightLabel}</span>
              )}
              <Image
                src="/icons/right.svg"
                alt=""
                width={24}
                height={24}
                className="shrink-0 opacity-80"
              />
            </span>
          </Link>
        ))}
      </nav>
      <div className="h-2 w-full bg-(--ds-gray-10)" aria-hidden />

      {/* 버전 정보 · 로그아웃 */}
      <nav className="px-4" aria-label="버전 및 계정">
        <div className="flex items-center justify-between py-3 text-ds-body text-(--ds-text-bolder)">
          <span>버전 정보</span>
          <span className="text-(--ds-text-subtle)">
            현재 버전 {MOCK_VERSION}
          </span>
        </div>
        <button
          type="button"
          className={cn(
            "flex w-full items-center py-3 text-left text-ds-body text-(--ds-text-subtle) active:opacity-70"
          )}
          onClick={() => {}}
        >
          로그아웃
        </button>
      </nav>
    </div>
  );
}
