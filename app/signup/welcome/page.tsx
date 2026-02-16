"use client";

import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { Button } from "@/components/ui/button";
import { withViewTransition } from "@/lib/view-transition";
import Image from "next/image";

/** Figma 1065-5872: 회원가입 완료 - 환영 화면 */
export default function SignupWelcomePage() {
  const router = useRouter();
  useHeaderBackground("white");

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4">
        <Image
          src="/icons/welcome.svg"
          alt=""
          width={140}
          height={140}
          className="mb-8 shrink-0"
          aria-hidden
        />
        <h1 className="text-center text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-gray-90">
          환영합니다!
        </h1>
        <p className="mt-2 text-center text-ds-body-16-r leading-ds-body-16-r text-primary">
          이제부터 나비와 함께 학사관리를 시작해요.
        </p>
      </div>
      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <Button
          type="button"
          size="lg"
          className="w-full touch-manipulation text-white"
          onClick={() => withViewTransition(() => router.push("/login"))}
        >
          나비 시작
        </Button>
      </div>
    </div>
  );
}
