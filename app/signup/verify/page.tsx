"use client";

import { useHeaderBackground } from "@/hooks/use-header-background";
import { TransitionLink } from "@/components/layout/transition-link";

/** 회원가입 3/6 플레이스홀더 (인증번호 입력) */
export default function SignupVerifyPage() {
  useHeaderBackground("white");

  return (
    <div className="min-h-full bg-white px-4 py-8">
      <p className="text-ds-body-16-r leading-ds-body-16-r text-ds-tertiary">
        3/6 인증번호 입력 (구현 예정)
      </p>
      <p className="mt-4">
        <TransitionLink href="/signup/email" className="text-primary underline">
          ← 2단계로
        </TransitionLink>
      </p>
    </div>
  );
}
