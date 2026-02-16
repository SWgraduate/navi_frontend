"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";
import { signupVerifyResendSchema, signupVerifySubmitSchema } from "@/lib/schemas/signup-verify";
import { Clock } from "lucide-react";

const CODE_LENGTH = 6;
const INITIAL_TIMER_SECONDS = 180; // 03:00
const BUTTON_AREA_HEIGHT = 80;
const MAX_RESEND_PER_DAY = 5;
const LOCK_HOURS = 24;

const STORAGE_KEY_RESEND = "signup_verify_resend";
const STORAGE_KEY_LOCKED_UNTIL = "signup_verify_locked_until";

function getTodayKey() {
  return typeof window !== "undefined" ? new Date().toISOString().slice(0, 10) : "";
}

function getResendCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESEND);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw) as { date: string; count: number };
    return date === getTodayKey() ? count : 0;
  } catch {
    return 0;
  }
}

function incrementResendCount(): number {
  const today = getTodayKey();
  const current = getResendCount();
  const next = current + 1;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_RESEND, JSON.stringify({ date: today, count: next }));
  }
  return next;
}

function getLockedUntil(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY_LOCKED_UNTIL);
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
}

function setLockedUntil(until: number) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY_LOCKED_UNTIL, String(until));
}

function isLockedNow(): boolean {
  const until = getLockedUntil();
  return until != null && Date.now() < until;
}

/** Figma 3/6: 회원가입 - 인증번호 6자리 입력 */
export default function SignupVerifyPage() {
  const router = useRouter();
  useHeaderBackground("white");
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [timerSeconds, setTimerSeconds] = useState(INITIAL_TIMER_SECONDS);
  const [storageSynced, setStorageSynced] = useState({ isLocked: false, resendCount: 0 });
  const [consecutiveFail, setConsecutiveFail] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isLocked = storageSynced.isLocked;
  const resendCount = storageSynced.resendCount;

  useEffect(() => {
    const tick = () =>
      setStorageSynced({ isLocked: isLockedNow(), resendCount: getResendCount() });
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const setResendCount = useCallback((n: number) => {
    setStorageSynced((prev) => ({ ...prev, resendCount: n }));
  }, []);
  const setIsLocked = useCallback((v: boolean) => {
    setStorageSynced((prev) => ({ ...prev, isLocked: v }));
  }, []);

  const code = digits.join("");
  const canSubmit = code.length === CODE_LENGTH && !isLocked;
  const canResend = resendCount < MAX_RESEND_PER_DAY && !isLocked;

  // 타이머
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const id = setInterval(() => setTimerSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [timerSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const setDigit = useCallback((index: number, value: string) => {
    // 한 글자만: 숫자만 허용, 빈 문자열이면 해당 칸 비우기 (maxLength=1이라 value 길이는 0 또는 1)
    const single = value === "" ? "" : value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = single;
      return next;
    });
    if (single && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH).split("");
    if (pasted.length === 0) return;
    setDigits((prev) => {
      const next = [...prev];
      pasted.forEach((n, i) => { next[index + i] = n; });
      return next;
    });
    const nextFocus = Math.min(index + pasted.length, CODE_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  }, []);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      return;
    }
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    const parsed = signupVerifyResendSchema.safeParse({ resendCount });
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? parsed.error.message);
      return;
    }
    setSubmitError(null);
    const next = incrementResendCount();
    setResendCount(next);
    setTimerSeconds(INITIAL_TIMER_SECONDS);
    setDigits(Array(CODE_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!canSubmit) return;
    const parsed = signupVerifySubmitSchema.safeParse({ code, timerSeconds });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? parsed.error.message;
      setSubmitError(msg);
      const isTimerExpired = parsed.error.issues[0]?.path?.[0] === "timerSeconds";
      if (!isTimerExpired) {
        const next = consecutiveFail + 1;
        setConsecutiveFail(next);
        if (next >= 5) {
          setLockedUntil(Date.now() + LOCK_HOURS * 60 * 60 * 1000);
          setIsLocked(true);
        }
      }
      return;
    }
    setConsecutiveFail(0);
    withViewTransition(() => router.push("/signup/password"));
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
          <span className="text-ds-brand">3</span> / 6
        </p>
        <div className="flex flex-col gap-1">
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            메일로 보내드린 인증번호
          </h1>
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            6자리를 입력해주세요
          </h1>
        </div>

        <div className="flex items-center gap-2 text-ds-body-16-r leading-ds-body-16-r text-ds-secondary">
          <Clock className="h-6 w-6 shrink-0" aria-hidden />
          <span>{formatTimer(timerSeconds)}</span>
        </div>

        {isLocked && (
          <p className="text-ds-body-16-r leading-ds-body-16-r text-destructive">
            24시간 후에 다시 시도해 주세요.
          </p>
        )}

        <form id="signup-verify-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2" role="group" aria-label="인증번호 6자리">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoComplete="one-time-code"
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onPaste={(e) => handlePaste(e, i)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isLocked}
                className={cn(
                  "h-15 w-12 flex-1 max-w-[52px] rounded-md border-2 bg-secondary text-center font-medium text-ds-primary",
                  "border-transparent focus:border-primary focus:outline-none focus:ring-0"
                )}
                style={{
                  fontSize: "var(--ds-typo-title-24-m-size)",
                  lineHeight: "var(--ds-typo-title-24-m-line)",
                }}
                aria-label={`자리 ${i + 1}`}
                aria-invalid={!!submitError}
              />
            ))}
          </div>
          {submitError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {submitError}
            </p>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={isLocked}
            className={cn(
              "flex items-center justify-start gap-1.5 text-ds-body-16-r leading-ds-body-16-r active:opacity-70",
              canResend ? "text-ds-brand" : "cursor-not-allowed text-ds-tertiary"
            )}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden className="shrink-0">
              <path d="M21 12C21 13.78 20.4722 15.5201 19.4832 17.0001C18.4943 18.4802 17.0887 19.6337 15.4442 20.3149C13.7996 20.9961 11.99 21.1743 10.2442 20.8271C8.49836 20.4798 6.89472 19.6226 5.63604 18.364C4.37737 17.1053 3.5202 15.5016 3.17294 13.7558C2.82567 12.01 3.0039 10.2004 3.68509 8.55585C4.36628 6.91131 5.51983 5.50571 6.99987 4.51677C8.47991 3.52784 10.22 3 12 3C14.52 3 16.93 4 18.74 5.74L21 8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 3V8H16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>인증번호 다시 받기</span>
          </button>

          <div className="flex flex-col gap-1 text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary">
            <p>유효시간이 지났을 경우 인증 번호를 다시 받아주세요.</p>
            <p>하루동안 5번까지 새로운 인증 코드를 받을 수 있습니다.</p>
            <p>5번 연속 코드 입력에 실패했다면 24시간 이후 시도해 주세요.</p>
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
          form="signup-verify-form"
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
          확인
        </Button>
      </div>
    </div>
  );
}
