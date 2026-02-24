"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";

const TERMS_ITEMS = [
  { id: "service", label: "[필수] 서비스 이용약관 동의", required: true },
  { id: "privacy", label: "[필수] 개인정보 수집 및 이용 동의", required: true },
  { id: "ai", label: "[필수] AI 서비스 결과 면책 동의", required: true },
  { id: "marketing", label: "[선택] 마케팅 정보 수신 동의", required: false },
] as const;

/** Figma 1192-11134: 회원가입 1/6 - 약관 동의 */
export default function SignupPage() {
  const router = useRouter();
  useHeaderBackground("white");

  const [agreed, setAgreed] = useState<Record<string, boolean>>({
    service: false,
    privacy: false,
    ai: false,
    marketing: false,
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

  const handleAgreeSubmit = () => {
    if (!allRequiredAgreed) return;
    withViewTransition(() => router.push("/signup/email"));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4"
        style={{
          paddingBottom: "calc(112px + var(--safe-area-inset-bottom, 0px) + 8px)",
        }}
      >
        <p className="text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
          <span className="text-ds-brand">1</span> / 6
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            나비가 처음이시군요
          </h1>
          <p className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            약관내용에 동의해주세요
          </p>
        </div>

        <div className="flex flex-col gap-6 rounded-md overflow-hidden">
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
            <span>필수 항목 모두 동의</span>
          </button>

          {TERMS_ITEMS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item.id)}
              className={cn(
                "flex items-center gap-3 py-4 pr-4 pl-4 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:opacity-70",
                index === TERMS_ITEMS.length - 1 && "rounded-b-md"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  agreed[item.id]
                    ? "border-primary bg-primary"
                    : "border-[var(--ds-gray-30)] bg-transparent"
                )}
                aria-hidden
              >
                {agreed[item.id] && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={cn("min-w-0 flex-1", item.required ? "" : "text-ds-tertiary")}>
                {item.required ? (
                  <>
                    <span className="text-ds-brand">[필수]</span>{" "}
                    {item.label.replace("[필수] ", "")}
                  </>
                ) : (
                  item.label
                )}
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-ds-tertiary" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12H19" />
                  <path d="M12 5L19 12L12 19" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>

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
          동의하기
        </Button>
      </div>
    </div>
  );
}
