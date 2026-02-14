"use client";

import { useState } from "react";
import Link from "next/link";
import { RightIcon } from "@/components/icons/header-icons";
import { Modal } from "@/components/ui/modal";
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

/** Figma 1086-8553 마이페이지. 로그아웃 확인: Figma 1128-8760 */
export default function MyPage() {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    // TODO: 실제 로그아웃 처리 (세션/토큰 제거, 리다이렉트 등)
  };

  return (
    <div className="bg-(--ds-gray-0)">
      {/* 사용자 정보 */}
      <section className="px-4 pb-16">
        <p className="font-semibold text-ds-title-24-sb leading-ds-title-24-sb text-ds-primary">
          {MOCK_USER.name}님
          <br />
          안녕하세요!
        </p>
        <p className="mt-1 text-ds-body-16-r leading-ds-body-16-r text-ds-tertiary">
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
            className="flex items-center justify-between py-3 text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:opacity-70"
          >
            <span>{item.label}</span>
            <span className="flex items-center gap-1 text-ds-tertiary">
              {item.rightLabel != null && <span>{item.rightLabel}</span>}
              <RightIcon className="text-ds-tertiary" />
            </span>
          </Link>
        ))}
      </nav>
      <div className="h-2 w-full bg-(--ds-gray-10)" aria-hidden />

      {/* 버전 정보 · 로그아웃 */}
      <nav className="px-4" aria-label="버전 및 계정">
        <div className="flex items-center justify-between py-3 text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
          <span>버전 정보</span>
          <span className="text-ds-tertiary">
            현재 버전 {MOCK_VERSION}
          </span>
        </div>
        <button
          type="button"
          className={cn(
            "flex w-full items-center py-3 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-tertiary active:opacity-70"
          )}
          onClick={() => setLogoutModalOpen(true)}
        >
          로그아웃
        </button>
      </nav>

      <Modal
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
        title="로그아웃 하시겠어요?"
        caption="언제든지 다시 로그인 할 수 있어요"
        cancelLabel="취소"
        confirmLabel="로그아웃"
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
