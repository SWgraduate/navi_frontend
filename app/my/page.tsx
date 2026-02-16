"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RightIcon } from "@/components/icons/header-icons";
import { TransitionLink } from "@/components/layout/transition-link";
import { Modal } from "@/components/ui/modal";
import { setLoggedIn } from "@/lib/auth-storage";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";

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
  const router = useRouter();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    setLoggedIn(false);
    withViewTransition(() => router.replace("/login"));
  };

  const handleWithdrawConfirm = () => {
    setWithdrawModalOpen(false);
    setLoggedIn(false);
    // TODO: 회원 탈퇴 API 호출
    withViewTransition(() => router.replace("/login"));
  };

  return (
    <div className="bg-(--ds-gray-0)">
      {/* 사용자 정보 */}
      <section className="px-4 py-16">
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
          <TransitionLink
            key={item.href}
            href={item.href}
            className="flex items-center justify-between py-3 text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:opacity-70"
          >
            <span>{item.label}</span>
            <span className="flex items-center gap-1 text-ds-tertiary">
              {item.rightLabel != null && <span>{item.rightLabel}</span>}
              <RightIcon className="text-ds-tertiary" />
            </span>
          </TransitionLink>
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
        <button
          type="button"
          className={cn(
            "flex w-full items-center py-3 text-left text-ds-body-16-r leading-ds-body-16-r text-destructive active:opacity-70"
          )}
          onClick={() => setWithdrawModalOpen(true)}
        >
          탈퇴하기
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
      <Modal
        open={withdrawModalOpen}
        onOpenChange={setWithdrawModalOpen}
        title="정말 NAVI를 떠나시겠어요?"
        caption={`삭제된 데이터는 다시 복구할 수 없으니
신중하게 결정해 주세요`}
        cancelLabel="취소"
        confirmLabel="탈퇴"
        confirmVariant="destructive"
        onConfirm={handleWithdrawConfirm}
      />
    </div>
  );
}
