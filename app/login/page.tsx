"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLoggedIn, saveEmail } from "@/lib/auth-storage";
import { login } from "@/lib/api/auth";
import { getMyProfile } from "@/lib/api/student";
import { updateProfileCache } from "@/hooks/use-profile";
import { loginFormSchema } from "@/lib/schemas/login";
import { TransitionLink } from "@/components/layout/transition-link";
import { withViewTransition } from "@/lib/view-transition";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const EMAIL_SUFFIX = "@hanyang.ac.kr";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  useHeaderBackground("white");

  const [emailPart, setEmailPart] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ emailPart: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const [credentialsErrors, setCredentialsErrors] = useState<{
    email?: string;
    password?: string;
  } | null>(null);

  const fieldErrors = useMemo(() => {
    if (!touched.emailPart && !touched.password) return {};
    const parsed = loginFormSchema.safeParse({ emailPart, password });
    if (parsed.success) return {};
    const flattened = parsed.error.flatten().fieldErrors;
    return {
      emailPart: flattened.emailPart?.[0],
      password: flattened.password?.[0],
    };
  }, [emailPart, password, touched.emailPart, touched.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ emailPart: true, password: true });

    const parsed = loginFormSchema.safeParse({ emailPart, password });
    if (!parsed.success) return;

    const fullEmail = `${parsed.data.emailPart}${EMAIL_SUFFIX}`.toLowerCase();

    setIsLoading(true);
    try {
      await login({ email: fullEmail, password: parsed.data.password });
      setCredentialsErrors(null);
      saveEmail(fullEmail);
      setLoggedIn(true);
      // 로그인 직후 프로필 프리페치 → 다른 기기/환경에서도 즉시 유저 정보 표시
      getMyProfile().then((profile) => {
        if (profile && typeof profile === "object" && !("error" in profile)) {
          updateProfileCache(profile);
        }
      }).catch(() => {});
      withViewTransition(() => router.replace("/home"));
    } catch {
      setCredentialsErrors({
        email: t("login.emailError"),
        password: t("login.passwordError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-white px-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="login-email" className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary">
            {t("login.emailLabel")}
          </label>
          <div
            className={`flex items-center rounded-lg border-2 bg-secondary ${(touched.emailPart && fieldErrors.emailPart) || credentialsErrors?.email ? "border-destructive" : "border-transparent focus-within:border-primary"}`}
          >
            <input
              id="login-email"
              type="text"
              inputMode="email"
              autoComplete="username"
              placeholder={t("login.emailPlaceholder")}
              value={emailPart}
              onChange={(e) => {
              setEmailPart(e.target.value);
              setCredentialsErrors(null);
            }}
              onBlur={() => setTouched((t) => ({ ...t, emailPart: true }))}
              className={`min-w-0 flex-1 rounded-lg bg-transparent p-4 text-ds-body-16-r leading-ds-body-16-r placeholder:text-ds-tertiary focus:outline-none focus:ring-0 ${(touched.emailPart && fieldErrors.emailPart) || credentialsErrors?.email ? "text-destructive" : "text-ds-gray-90"}`}
            />
            <span className="shrink-0 pr-4 text-ds-body-16-r leading-ds-body-16-r text-ds-secondary">
              {EMAIL_SUFFIX}
            </span>
          </div>
          {((touched.emailPart && fieldErrors.emailPart) || credentialsErrors?.email) && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {credentialsErrors?.email ?? t(fieldErrors.emailPart ?? "")}
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="login-password" className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary">
            {t("login.passwordLabel")}
          </label>
          <div
            className={`relative flex items-center rounded-lg border-2 bg-secondary ${(touched.password && fieldErrors.password) || credentialsErrors?.password ? "border-destructive" : "border-transparent focus-within:border-primary"}`}
          >
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("login.passwordPlaceholder")}
              value={password}
              onChange={(e) => {
              setPassword(e.target.value);
              setCredentialsErrors(null);
            }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className="w-full rounded-lg bg-transparent py-4 pl-4 pr-12 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-md text-ds-tertiary active:bg-ds-gray-10"
              aria-label={showPassword ? t("common.hidePassword") : t("common.showPassword")}
            >
              {showPassword ? <EyeOff style={{ width: 24, height: 24 }} /> : <Eye style={{ width: 24, height: 24 }} />}
            </button>
          </div>
          {((touched.password && fieldErrors.password) || credentialsErrors?.password) && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {credentialsErrors?.password ?? t(fieldErrors.password ?? "")}
            </p>
          )}
        </div>

        {/* 링크: 아이디 찾기 | 비밀번호 찾기 | 회원가입 */}
        <div className="flex items-center justify-center gap-8 text-ds-caption-14-m leading-ds-caption-14-m text-medium text-ds-Secondary mt-2">
          <button type="button" className="active:opacity-70">
            {t("login.findId")}
          </button>
          <span aria-hidden
          className="text-[#EEEFF1]">|</span>
          <button type="button" className="active:opacity-70">
            {t("login.findPassword")}
          </button>
          <span aria-hidden
          className="text-[#EEEFF1]">|</span>
          <TransitionLink href="/signup" className="active:opacity-70">
            {t("login.signupLink")}
          </TransitionLink>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading}
          className="h-auto w-full py-3 text-ds-body-16-sb leading-ds-body-16-sb text-white mt-4"
        >
          {isLoading ? t("common.loading") : t("login.submit")}
        </Button>
      </form>
    </div>
  );
}
