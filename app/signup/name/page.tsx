"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/view-transition";
import { signupNameFormSchema } from "@/lib/schemas/signup-name";

const BUTTON_AREA_HEIGHT = 80;

/** Figma 4/6: 회원가입 - 이름 입력 */
export default function SignupNamePage() {
  const router = useRouter();
  useHeaderBackground("white");
  const { keyboardHeight } = useKeyboardStatus();
  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const fieldErrors = useMemo(() => {
    if (!touched) return {};
    const parsed = signupNameFormSchema.safeParse({ name });
    if (parsed.success) return {};
    const flattened = parsed.error.flatten().fieldErrors;
    return { name: flattened.name?.[0] };
  }, [name, touched]);

  const canSubmit = useMemo(() => signupNameFormSchema.safeParse({ name }).success, [name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const parsed = signupNameFormSchema.safeParse({ name });
    if (!parsed.success) return;
    if (typeof window !== "undefined") sessionStorage.setItem("signup_name", parsed.data.name);
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
          <span className="text-ds-brand">4</span> / 6
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            이제 이름을 알려주세요
          </h1>
        </div>

        <form id="signup-name-form" onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label
            htmlFor="signup-name"
            className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary"
          >
            이름
          </label>
          <div className="flex items-center rounded-md border-2 border-transparent bg-secondary focus-within:border-primary">
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              className="min-w-0 flex-1 rounded-md bg-transparent p-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:outline-none focus:ring-0"
            />
          </div>
          {touched && fieldErrors.name && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {fieldErrors.name}
            </p>
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
          form="signup-name-form"
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
