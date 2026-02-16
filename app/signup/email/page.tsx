"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";

const EMAIL_SUFFIX = "@hanyang.ac.kr";

const BUTTON_AREA_HEIGHT = 80; // pt-8 + button + paddingBottom

/** Figma 2/6: 회원가입 - 학교 메일 재학생 인증 */
export default function SignupEmailPage() {
  const router = useRouter();
  useHeaderBackground("white");
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [emailPart, setEmailPart] = useState("");

  const canSubmit = emailPart.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: 인증번호 발송 API 연동
    withViewTransition(() => router.push("/signup/verify"));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 transition-[padding-bottom] duration-250 ease-out"
        style={{
          paddingBottom: effectiveKeyboardInset > 0
            ? `calc(${BUTTON_AREA_HEIGHT}px + ${effectiveKeyboardInset}px + var(--safe-area-inset-bottom, 0px) + 8px)`
            : "calc(112px + var(--safe-area-inset-bottom, 0px) + 8px)",
        }}
      >
        <p className="text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
          <span className="text-ds-brand">2</span> / 6
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            먼저 학교 메일로
          </h1>
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            재학생 인증을 진행할게요
          </h1>
          <p className="text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary, font-regular">
            이 메일은 앞으로 로그인에 사용돼요
          </p>
        </div>

        <form id="signup-email-form" onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label
            htmlFor="signup-email"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            이메일
          </label>
          <div className="flex items-center rounded-md border-2 border-transparent bg-secondary focus-within:border-primary">
            <input
              id="signup-email"
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder="이메일을 입력해주세요"
              value={emailPart}
              onChange={(e) => setEmailPart(e.target.value)}
              className="min-w-0 flex-1 rounded-md bg-transparent p-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:outline-none focus:ring-0"
            />
            <span className="shrink-0 pr-4 text-ds-body-16-r leading-ds-body-16-r text-ds-secondary">
              {EMAIL_SUFFIX}
            </span>
          </div>
        </form>
      </div>

      <div
        className="fixed left-0 right-0 z-10 bg-white pt-8 pb-8 transition-[bottom] duration-250 ease-out"
        style={{
          bottom: effectiveKeyboardInset > 0
            ? `${effectiveKeyboardInset}px`
            : "calc(32px + var(--safe-area-inset-bottom, 0px))",
          paddingBottom: "8px",
          maxWidth: "var(--app-max-width)",
          margin: "0 auto",
        }}
      >
        <Button
          type="submit"
          form="signup-email-form"
          variant="primary"
          size="lg"
          className={cn(
            "h-auto w-full rounded-none py-4 text-ds-body-16-sb leading-ds-body-16-sb",
            canSubmit
              ? "bg-primary text-primary-foreground"
              : "bg-[#EEEFF1] text-ds-disabled"
          )}
          disabled={!canSubmit}
        >
          인증번호 받기
        </Button>
      </div>
    </div>
  );
}
