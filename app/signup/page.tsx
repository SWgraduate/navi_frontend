"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const SIGNUP_AGREED_KEY = "signup-agreed";

const TERMS_ITEMS = [
  { id: "service", required: true },
  { id: "privacy", required: true },
  { id: "ai", required: true },
  { id: "marketing", required: false },
] as const;

const DEFAULT_AGREED: Record<string, boolean> = {
  service: false,
  privacy: false,
  ai: false,
  marketing: false,
};

/** Figma 1192-11134: 회원가입 1/6 - 약관 동의 */
export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  useHeaderBackground("white");

  const [agreed, setAgreed] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return DEFAULT_AGREED;
    try {
      const stored = sessionStorage.getItem(SIGNUP_AGREED_KEY);
      if (!stored) return DEFAULT_AGREED;
      const parsed = JSON.parse(stored) as Record<string, boolean>;
      sessionStorage.removeItem(SIGNUP_AGREED_KEY);
      return { ...DEFAULT_AGREED, ...parsed };
    } catch {
      sessionStorage.removeItem(SIGNUP_AGREED_KEY);
      return DEFAULT_AGREED;
    }
  });

  const agreeAll = useMemo(
    () => TERMS_ITEMS.filter((t) => t.required).every((t) => agreed[t.id]),
    [agreed]
  );

  const allRequiredAgreed = agreed.service && agreed.privacy && agreed.ai;

  const handleAgreeAll = () => {
    const next = !agreeAll;
    setAgreed((prev) => ({
      ...prev,
      service: next,
      privacy: next,
      ai: next,
    }));
  };

  const handleToggle = (id: string) => {
    setAgreed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGoToTerms = (id: string) => {
    // 약관 상세에서 돌아올 때 현재 체크 상태 복원용으로 저장
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SIGNUP_AGREED_KEY, JSON.stringify(agreed));
    }
    withViewTransition(() => router.push(`/signup/terms/${id}`));
  };

  const handleAgreeSubmit = () => {
    if (!allRequiredAgreed) return;
    withViewTransition(() => router.push("/signup/email"));
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      {/* 스크롤 영역: 동의하기 버튼 바로 위까지 */}
      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pt-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <p className="text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
          <span className="text-ds-brand">1</span> / 6
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            {t("signup.terms.title1")}
          </h1>
          <p className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            {t("signup.terms.title2")}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 rounded-md overflow-hidden">
          <button
            type="button"
            onClick={handleAgreeAll}
            className={cn(
              "flex items-center gap-3 rounded-sm py-4 pr-4 pl-4 text-left text-ds-body-16-sb leading-ds-body-16-sb",
              "bg-background text-ds-primary active:opacity-70 font-semibold"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                agreeAll
                  ? "border-primary bg-primary"
                  : "border-[var(--ds-gray-30)] bg-transparent"
              )}
              aria-hidden
            >
              {agreeAll && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span>{t("signup.terms.allRequired")}</span>
          </button>

          {TERMS_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 py-4 pr-4 pl-4 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-primary",
                index === TERMS_ITEMS.length - 1 && "rounded-b-md"
              )}
            >
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 active:opacity-70 focus:outline-none"
                style={{
                  borderColor: agreed[item.id] ? "var(--primary)" : "var(--ds-gray-30)",
                  backgroundColor: agreed[item.id] ? "var(--primary)" : "transparent",
                }}
                aria-label={t(`signup.terms.${item.id}`)}
                aria-pressed={agreed[item.id]}
              >
                {agreed[item.id] && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleGoToTerms(item.id)}
                className="min-w-0 flex-1 flex items-center gap-3 text-left active:opacity-70 focus:outline-none"
              >
                <span className={cn("min-w-0 flex-1", item.required ? "" : "text-ds-tertiary")}>
                  {item.required ? (
                    <>
                      <span className="text-ds-brand">{t("signup.terms.requiredBadge")}</span>{" "}
                      {t(`signup.terms.${item.id}`)}
                    </>
                  ) : (
                    <>
                      <span>{t("signup.terms.optionalBadge")}</span>{" "}
                      {t(`signup.terms.${item.id}`)}
                    </>
                  )}
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center text-ds-tertiary" aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12H19" />
                    <path d="M12 5L19 12L12 19" />
                  </svg>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 스크롤 영역이 버튼 바로 위까지이도록 하단 공간 확보 */}
      <div
        className="shrink-0"
        style={{
          height: "calc(4rem + 8px + max(8px, env(safe-area-inset-bottom, 0px)))",
        }}
        aria-hidden
      />

      <div
        className="fixed left-0 right-0 z-10 bg-white px-4 pt-8 pb-8"
        style={{
          bottom: "calc(32px + var(--safe-area-inset-bottom, 0px))",
          paddingBottom: "8px",
          maxWidth: "var(--app-max-width)",
          margin: "0 auto",
        }}
      >
        <Button
          type="button"
          variant="primary"
          size="lg"
          className={cn(
            "h-auto w-full rounded-sm py-4 text-ds-body-16-sb leading-ds-body-16-sb",
            allRequiredAgreed
              ? "bg-primary text-primary-foreground"
              : "bg-(--ds-bg-disabled) text-ds-disabled"
          )}
          disabled={!allRequiredAgreed}
          onClick={handleAgreeSubmit}
        >
          {t("signup.terms.submit")}
        </Button>
      </div>
    </div>
  );
}
