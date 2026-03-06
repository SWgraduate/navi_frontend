"use client";

import { Fragment } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { Button } from "@/components/ui/button";
import { withViewTransition } from "@/lib/view-transition";
import { AI_TERMS } from "../content/ai";
import { MARKETING_TERMS } from "../content/marketing";
import { PRIVACY_POLICY_INTRO, PRIVACY_POLICY_SECTIONS } from "../content/privacy-policy";
import { PRIVACY_TERMS } from "../content/privacy";
import { SERVICE_TERMS_SECTIONS } from "../content/service";

const TERMS_META: Record<string, { title: string }> = {
  service: { title: "서비스 이용약관" },
  privacy: { title: "개인정보 수집 및 이용 동의" },
  "privacy-policy": { title: "NAVI 개인정보 처리방침" },
  ai: { title: "AI 서비스 결과 면책 동의" },
  marketing: { title: "마케팅 정보 수신 동의" },
};

/** 회원가입 - 약관 동의 상세 페이지 (Figma 1292-9411: 서비스 이용약관) */
export default function SignupTermsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params.id === "string" ? params.id : "";
  useHeaderBackground("white");

  const fromMy = searchParams.get("from") === "my";

  const meta = id && TERMS_META[id];
  const title = (meta && "title" in meta ? meta.title : undefined) ?? "약관";

  const handleBack = () => {
    if (showAgreeButton && id && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("signup-agreed");
        const agreed = stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
        agreed[id] = true;
        sessionStorage.setItem("signup-agreed", JSON.stringify(agreed));
      } catch {
        sessionStorage.setItem("signup-agreed", JSON.stringify({ [id]: true }));
      }
    }
    withViewTransition(() => router.back());
  };

  const isService = id === "service";
  const isPrivacy = id === "privacy";
  const isPrivacyPolicy = id === "privacy-policy";
  const isAi = id === "ai";
  const isMarketing = id === "marketing";
  const showAgreeButton = !fromMy && !isPrivacyPolicy;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
      {/* 스크롤 영역: 페이지 내부에서 스크롤 */}
      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          paddingTop: "1rem",
          paddingBottom: fromMy || isPrivacyPolicy ? "calc(3rem + env(safe-area-inset-bottom, 0px))" : undefined,
        }}
      >
        {isService ? (
          <div className="flex flex-col gap-4 pb-15 text-ds-caption-14-r leading-ds-caption-14-r text-ds-secondary tracking-[-0.35px]">
            {SERVICE_TERMS_SECTIONS.map((section) => (
              <section key={section.title} className="flex flex-col gap-1">
                <p className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-secondary">
                  {section.title}
                </p>
                <p className="whitespace-pre-wrap">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        ) : isPrivacyPolicy ? (
          <div className="flex flex-col gap-4 pb-6 text-ds-caption-14-r leading-ds-caption-14-r text-ds-secondary tracking-[-0.35px]">
            <p>{PRIVACY_POLICY_INTRO}</p>
            {PRIVACY_POLICY_SECTIONS.map((section) => (
              <section key={section.title} className="flex flex-col gap-1">
                <p className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-secondary">
                  {section.title}
                </p>
                {"body" in section ? (
                  <p className="whitespace-pre-wrap">
                    {section.body}
                    {"contactEmail" in section && section.contactEmail && (
                      <a
                        href={`mailto:${section.contactEmail}`}
                        className="underline decoration-solid underline-offset-2"
                      >
                        {section.contactEmail}
                      </a>
                    )}
                    {"bodyEnd" in section && section.bodyEnd}
                  </p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {"items" in section &&
                      section.items.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : isPrivacy ? (
          <div className="flex flex-col gap-4 pb-6 text-ds-caption-14-r leading-ds-caption-14-r text-ds-secondary tracking-[-0.35px]">
            <p>{PRIVACY_TERMS.intro}</p>
            <div
              className="grid w-full overflow-hidden rounded-md border border-border"
              style={{
                gridTemplateColumns: "1fr 135px 110px",
              }}
            >
              {/* 헤더 행 */}
              <div className="flex items-center border-b border-r border-border bg-muted px-2 py-2">
                <p className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-secondary">
                  {PRIVACY_TERMS.table.headers[0]}
                </p>
              </div>
              <div className="flex items-center border-b border-r border-border bg-muted px-2 py-2">
                <p className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-secondary">
                  {PRIVACY_TERMS.table.headers[1]}
                </p>
              </div>
              <div className="flex items-center border-b border-border bg-muted px-2 py-2">
                <p className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-secondary">
                  {PRIVACY_TERMS.table.headers[2]}
                </p>
              </div>
              {/* 데이터 행 - 가로 라인 맞춤, 보유기간 하나로 통일 */}
              {PRIVACY_TERMS.table.rows.map((row, i) => (
                <Fragment key={i}>
                  <div
                    className={`flex min-h-10 items-center border-r border-border px-2 py-2 ${i < PRIVACY_TERMS.table.rows.length - 1 ? "border-b" : ""}`}
                  >
                    <p className="whitespace-pre-wrap">{row.purpose}</p>
                  </div>
                  <div
                    className={`flex min-h-10 items-center border-r border-border px-2 py-2 ${i < PRIVACY_TERMS.table.rows.length - 1 ? "border-b" : ""}`}
                  >
                    <p>{row.items}</p>
                  </div>
                  {i === 0 && (
                    <div
                      className="flex min-h-0 items-center justify-center border-b border-border px-2 py-2"
                      style={{ gridRow: "span 3" }}
                    >
                      <p>{PRIVACY_TERMS.table.retention}</p>
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
            <p>{PRIVACY_TERMS.disclaimer}</p>
          </div>
        ) : isAi ? (
          <div className="flex flex-col gap-4 pb-6 text-ds-caption-14-r leading-ds-caption-14-r text-ds-secondary tracking-[-0.35px]">
            <div className="rounded-lg bg-destructive/10 px-4 py-2">
              <p className="text-ds-caption-14-m font-medium text-destructive">
                {AI_TERMS.notice}
              </p>
            </div>
            {AI_TERMS.sections.map((section) => (
              <section key={section.title} className="flex flex-col gap-1">
                <p className="text-ds-caption-14-m font-medium text-ds-secondary">
                  {section.title}
                </p>
                <p className="whitespace-pre-wrap">{section.body}</p>
              </section>
            ))}
          </div>
        ) : isMarketing ? (
          <div className="flex flex-col gap-4 pb-6 text-ds-caption-14-r leading-ds-caption-14-r text-ds-secondary tracking-[-0.35px]">
            <p className="text-ds-caption-14-m font-medium text-ds-secondary">
              {MARKETING_TERMS.intro}
            </p>
            {MARKETING_TERMS.sections.map((section) => (
              <section key={section.title} className="flex flex-col gap-1">
                <p className="text-ds-caption-14-m font-medium text-ds-secondary">
                  {section.title}
                </p>
                {"body" in section ? (
                  <p>{section.body}</p>
                ) : (
                  <ul className="list-disc pl-5 [&>li]:mb-1 [&>li:last-child]:mb-0">
                    {section.items.map((item) => (
                      <li key={item}>
                        <span className="leading-[1.5]">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            <p>{MARKETING_TERMS.disclaimer}</p>
          </div>
        ) : (
          <div className="pb-6">
            <h1 className="text-ds-title-20-sb leading-ds-title-20-sb font-semibold text-ds-primary">
              {title}
            </h1>
            <div className="mt-4 text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
              <p className="whitespace-pre-wrap">
                {id && meta
                  ? `${title} 약관 내용이 여기에 표시됩니다.`
                  : "약관을 찾을 수 없습니다."}
              </p>
            </div>
          </div>
        )}
      </div>

      {showAgreeButton && (
        <>
          {/* 버튼 + 하단 여백 (스크롤 밖 고정) */}
          <div
            className="shrink-0 bg-white"
            style={{
              height: "calc(3.5rem + 1rem + 2rem + max(1rem, env(safe-area-inset-bottom, 0px)))",
            }}
            aria-hidden
          />
          {/* 하단 고정 버튼 */}
          <div
            className="fixed left-0 right-0 z-10 bg-white px-4 pt-4"
            style={{
              bottom: "env(safe-area-inset-bottom, 0px)",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
              maxWidth: "var(--app-max-width)",
              margin: "0 auto",
            }}
          >
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="h-auto w-full rounded-lg py-3 text-ds-body-16-sb leading-ds-body-16-sb text-white"
              onClick={handleBack}
            >
              동의하기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
