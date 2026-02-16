"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";
import { PASSWORD_RULE_MESSAGE, signupPasswordFormSchema } from "@/lib/schemas/signup-password";
import { Eye, EyeOff } from "lucide-react";

const BUTTON_AREA_HEIGHT = 80;
const SIGNUP_NAME_KEY = "signup_name";

/** Figma 5/6: 회원가입 - 비밀번호 설정 (첫 입력 후 재확인 필드 표시) */
export default function SignupPasswordPage() {
  const router = useRouter();
  useHeaderBackground("white");
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [signupName, setSignupName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [touched, setTouched] = useState({ password: false, passwordConfirm: false });
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(SIGNUP_NAME_KEY) : null;
    const id = requestAnimationFrame(() => {
      if (stored != null) setSignupName(stored);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const showConfirmField = password.length > 0;

  const fieldErrors = useMemo(() => {
    if (!touched.password && !touched.passwordConfirm) return {};
    const parsed = signupPasswordFormSchema.safeParse({
      password,
      passwordConfirm: showConfirmField ? passwordConfirm : password,
    });
    if (parsed.success) return {};
    const flattened = parsed.error.flatten().fieldErrors;
    return {
      password: flattened.password?.[0],
      passwordConfirm: showConfirmField ? flattened.passwordConfirm?.[0] : undefined,
    };
  }, [password, passwordConfirm, touched.password, touched.passwordConfirm, showConfirmField]);

  const canSubmit =
    showConfirmField &&
    signupPasswordFormSchema.safeParse({ password, passwordConfirm }).success;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, passwordConfirm: true });
    const parsed = signupPasswordFormSchema.safeParse({ password, passwordConfirm });
    if (!parsed.success) return;
    // TODO: 회원가입 API (비밀번호 저장)
    withViewTransition(() => router.push("/signup/complete"));
  };

  const displayName = signupName.trim() || "회원";

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
          <span className="text-ds-brand">5</span> / 6
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            {displayName}님 반갑습니다!
          </h1>
          <p className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            사용할 비밀번호를 입력해주세요
          </p>
        </div>

        <form id="signup-password-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-password"
              className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
            >
              비밀번호
            </label>
            <div
              className={cn(
                "relative flex items-center rounded-md border-2 bg-secondary",
                touched.password && fieldErrors.password
                  ? "border-destructive"
                  : "border-transparent focus-within:border-primary"
              )}
            >
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="비밀번호를 입력해주세요."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordHint(true)}
                onBlur={() => {
                  setTouched((t) => ({ ...t, password: true }));
                  setShowPasswordHint(false);
                }}
                className={cn(
                  "min-w-0 flex-1 rounded-md bg-transparent p-4 pr-12 text-ds-body-16-r leading-ds-body-16-r placeholder:text-ds-tertiary focus:outline-none focus:ring-0",
                  touched.password && fieldErrors.password ? "text-destructive" : "text-ds-gray-90"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-md text-ds-tertiary active:bg-ds-gray-10"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? (
                  <EyeOff className="h-6 w-6" aria-hidden />
                ) : (
                  <Eye className="h-6 w-6" aria-hidden />
                )}
              </button>
            </div>
            {(showPasswordHint || (touched.password && fieldErrors.password)) && (
              <p
                className={cn(
                  "font-medium",
                  touched.password && fieldErrors.password
                    ? "text-destructive"
                    : "text-ds-brand"
                )}
                style={{
                  fontSize: "var(--ds-typo-caption-14-m-size)",
                  lineHeight: "var(--ds-typo-caption-14-m-line)",
                }}
              >
                {touched.password && fieldErrors.password
                  ? fieldErrors.password
                  : PASSWORD_RULE_MESSAGE}
              </p>
            )}
          </div>

          {showConfirmField && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="signup-password-confirm"
                className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
              >
                비밀번호 재확인
              </label>
              <div
                className={cn(
                  "relative flex items-center rounded-md border-2 bg-secondary",
                  touched.passwordConfirm && fieldErrors.passwordConfirm
                    ? "border-destructive"
                    : "border-transparent focus-within:border-primary"
                )}
              >
                <input
                  id="signup-password-confirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="비밀번호를 다시 입력해주세요."
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, passwordConfirm: true }))}
                  className={cn(
                    "min-w-0 flex-1 rounded-md bg-transparent p-4 pr-12 text-ds-body-16-r leading-ds-body-16-r placeholder:text-ds-tertiary focus:outline-none focus:ring-0",
                    touched.passwordConfirm && fieldErrors.passwordConfirm
                      ? "text-destructive"
                      : "text-ds-gray-90"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((v) => !v)}
                  className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-md text-ds-tertiary active:bg-ds-gray-10"
                  aria-label={showPasswordConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-6 w-6" aria-hidden />
                  ) : (
                    <Eye className="h-6 w-6" aria-hidden />
                  )}
                </button>
              </div>
              {touched.passwordConfirm && fieldErrors.passwordConfirm && (
                <p
                  className="font-medium text-destructive"
                  style={{
                    fontSize: "var(--ds-typo-caption-14-m-size)",
                    lineHeight: "var(--ds-typo-caption-14-m-line)",
                  }}
                >
                  {fieldErrors.passwordConfirm}
                </p>
              )}
            </div>
          )}
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
          form="signup-password-form"
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
          다음
        </Button>
      </div>
    </div>
  );
}
