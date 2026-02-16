"use client";

import { useHeaderBackground } from "@/hooks/use-header-background";
import { TransitionLink } from "@/components/layout/transition-link";

/** 회원가입 5/6 플레이스홀더 (비밀번호 설정) */
export default function SignupPasswordPage() {
  useHeaderBackground("white");

  return (
    <div className="min-h-full bg-white px-4 py-8">
      <p className="text-ds-body-16-r leading-ds-body-16-r text-ds-tertiary">
        5/6 비밀번호 설정 (구현 예정)
      </p>
      <p className="mt-4">
        <TransitionLink href="/signup/name" className="text-primary underline">
          ← 4단계로
        </TransitionLink>
      </p>
    </div>
  );
}
