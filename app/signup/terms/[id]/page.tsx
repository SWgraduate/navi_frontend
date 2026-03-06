"use client";

import { useRouter, useParams } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { withViewTransition } from "@/lib/view-transition";

const TERMS_META: Record<string, { title: string }> = {
  service: { title: "서비스 이용약관" },
  privacy: { title: "개인정보 수집 및 이용 동의" },
  ai: { title: "AI 서비스 결과 면책 동의" },
  marketing: { title: "마케팅 정보 수신 동의" },
};

/** 회원가입 - 약관 동의 상세 페이지 */
export default function SignupTermsPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  useHeaderBackground("white");

  const meta = id && TERMS_META[id];
  const title = (meta && "title" in meta ? meta.title : undefined) ?? "약관";

  const handleBack = () => {
    withViewTransition(() => router.back());
  };

  return (
    <div className="flex min-h-full flex-col bg-white">
      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
        style={{
          paddingBottom: "calc(2rem + var(--safe-area-inset-bottom, 0px))",
        }}
      >
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
      <div
        className="shrink-0 border-t border-(--ds-gray-10) bg-white px-4 py-4"
        style={{
          paddingBottom: "max(1rem, var(--safe-area-inset-bottom, 0px))",
          maxWidth: "var(--app-max-width)",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          className="w-full rounded-sm border border-(--ds-gray-10) bg-white py-3 text-ds-body-16-sb text-ds-primary active:opacity-80"
        >
          뒤로
        </button>
      </div>
    </div>
  );
}
