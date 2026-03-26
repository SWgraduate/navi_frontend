"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RightIcon } from "@/components/icons/header-icons";
import { TransitionLink } from "@/components/layout/transition-link";
import { Modal } from "@/components/ui/modal";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { setLoggedIn, getEmail } from "@/lib/auth-storage";
import { clearProfileCache } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/use-profile";
import { logout, leave } from "@/lib/api/auth";

const MOCK_VERSION = "1.00";

/** Figma 1086-8553 마이페이지. 로그아웃 확인: Figma 1128-8760 */
export default function MyPage() {
  useHeaderBackground("white"); // 헤더·노치 영역 배경 흰색
  const router = useRouter();
  const { t } = useTranslation();
  const { profile } = useProfile();
  const email = getEmail();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const settingItems = [
    { label: t("my.personalInfo"), href: "/my/personal" },
    {
      label: t("my.language"),
      href: "/my/language",
      rightLabel: t("my.languageValue"),
    },
  ];

  const finalizeLocalLogout = () => {
    clearProfileCache();
    setLoggedIn(false);
    localStorage.removeItem("navi_graduation_result");
    withViewTransition(() => router.replace("/login"));
  };

  const handleLogoutConfirm = async () => {
    if (isLoggingOut) return;
    setLogoutError(null);
    setIsLoggingOut(true);
    try {
      await logout();
      setLogoutModalOpen(false);
      finalizeLocalLogout();
    } catch (err) {
      setLogoutError(err instanceof Error ? err.message : "로그아웃에 실패했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    if (isWithdrawing) return;
    setWithdrawError(null);
    setIsWithdrawing(true);
    try {
      await leave();
      setWithdrawModalOpen(false);
      finalizeLocalLogout();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "회원 탈퇴에 실패했습니다.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="bg-(--ds-gray-0)">
      {/* 사용자 정보 - 메인과 동일한 높이에서 시작 (pt-4) */}
      <section className="px-4 pt-20 pb-16">
        <p className="font-semibold text-ds-title-24-sb leading-ds-title-24-sb text-ds-primary">
          {t("my.greetingName", { name: profile?.name ?? "" })}
          <br />
          {t("my.greetingText")}
        </p>
        {email && (
          <p className="mt-1 text-ds-body-16-r leading-ds-body-16-r text-ds-tertiary">
            {email}
          </p>
        )}
      </section>
      <div className="h-2 w-full bg-background" aria-hidden />

      {/* 설정 메뉴 */}
      <nav className="px-4" aria-label={t("my.personalInfo")}>
        {settingItems.map((item) => (
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
      <div className="h-2 w-full bg-background" aria-hidden />

      {/* 약관 및 개인정보 처리 동의 */}
      <nav className="px-4" aria-label={t("my.terms")}>
        <TransitionLink
          href="/my/terms"
          className="flex items-center justify-between py-3 text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:opacity-70"
        >
          <span>{t("my.terms")}</span>
          <RightIcon className="text-ds-tertiary" />
        </TransitionLink>
      </nav>
      <div className="h-2 w-full bg-background" aria-hidden />

      {/* 버전 정보 · 로그아웃 */}
      <nav className="px-4" aria-label={t("my.versionLabel")}>
        <div className="flex items-center justify-between py-3 text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
          <span>{t("my.versionLabel")}</span>
          <span className="text-ds-tertiary">
            {t("my.currentVersion", { version: MOCK_VERSION })}
          </span>
        </div>
        <button
          type="button"
          className={cn(
            "flex w-full items-center py-3 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-tertiary active:opacity-70"
          )}
          onClick={() => {
            setLogoutError(null);
            setLogoutModalOpen(true);
          }}
        >
          {t("my.logout")}
        </button>
        <button
          type="button"
          className={cn(
            "flex w-full items-center py-3 text-left text-ds-body-16-r leading-ds-body-16-r text-destructive active:opacity-70"
          )}
          onClick={() => {
            setWithdrawError(null);
            setWithdrawModalOpen(true);
          }}
        >
          {t("my.withdraw")}
        </button>
      </nav>

      <Modal
        open={logoutModalOpen}
        onOpenChange={setLogoutModalOpen}
        title={t("my.logoutModalTitle")}
        caption={t("my.logoutModalCaption")}
        cancelLabel={t("my.cancel")}
        confirmLabel={t("my.logoutConfirm")}
        onConfirm={handleLogoutConfirm}
        confirmDisabled={isLoggingOut}
      >
        {logoutError && (
          <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
            {logoutError}
          </p>
        )}
      </Modal>
      <Modal
        open={withdrawModalOpen}
        onOpenChange={setWithdrawModalOpen}
        title={t("my.withdrawModalTitle")}
        caption={t("my.withdrawModalCaption")}
        cancelLabel={t("my.cancel")}
        confirmLabel={t("my.withdrawConfirm")}
        confirmVariant="destructive"
        onConfirm={handleWithdrawConfirm}
        confirmDisabled={isWithdrawing}
      >
        {withdrawError && (
          <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
            {withdrawError}
          </p>
        )}
      </Modal>
    </div>
  );
}
