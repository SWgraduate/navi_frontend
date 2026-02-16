"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLoggedIn } from "@/lib/auth-storage";
import { matchMockAccount } from "@/lib/mock-accounts";
import { withViewTransition } from "@/lib/view-transition";

const EMAIL_SUFFIX = "@hanyang.ac.kr";

export default function LoginPage() {
  const router = useRouter();
  useHeaderBackground("white");

  const [emailPart, setEmailPart] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const fullEmail = `${emailPart.trim()}${EMAIL_SUFFIX}`.toLowerCase();
    if (matchMockAccount(fullEmail, password)) {
      setLoggedIn(true);
      withViewTransition(() => router.replace("/"));
    } else {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="min-h-full bg-white px-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="login-email" className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary">
            이메일
          </label>
          <div className="flex items-center rounded-lg bg-secondary">
            <input
              id="login-email"
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder="이메일을 입력해주세요"
              value={emailPart}
              onChange={(e) => setEmailPart(e.target.value)}
              className="min-w-0 flex-1 rounded-lg bg-transparent p-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset"
            />
            <span className="shrink-0 pr-4 text-ds-body-16-r leading-ds-body-16-r text-ds-secondary">
              {EMAIL_SUFFIX}
            </span>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="login-password" className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary">
            비밀번호
          </label>
          <div className="relative flex items-center rounded-lg bg-secondary">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-transparent py-4 pl-4 pr-12 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-md text-ds-tertiary active:bg-ds-gray-10"
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            >
              {showPassword ? <EyeOff style={{ width: 24, height: 24 }} /> : <Eye style={{ width: 24, height: 24 }} />}
            </button>
          </div>
        </div>

        {/* 링크: 아이디 찾기 | 비밀번호 찾기 | 회원가입 */}
        <div className="flex items-center justify-center gap-8 text-ds-caption-14-m leading-ds-caption-14-m text-medium text-ds-Secondary mt-2">
          <button type="button" className="active:opacity-70">
            아이디 찾기
          </button>
          <span aria-hidden
          className="text-[#EEEFF1]">|</span>
          <button type="button" className="active:opacity-70">
            비밀번호 찾기
          </button>
          <span aria-hidden
          className="text-[#EEEFF1]">|</span>
          <button type="button" className="active:opacity-70">
            회원가입
          </button>
        </div>

        {error && (
          <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="h-auto w-full py-4 text-ds-body-16-sb leading-ds-body-16-sb text-white mt-4"
        >
          로그인
        </Button>
      </form>
    </div>
  );
}
