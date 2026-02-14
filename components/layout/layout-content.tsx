"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { BottomBar } from "@/components/layout/bottom-bar";
import { ChatInput } from "@/components/layout/chat-input";
import { cn } from "@/lib/utils";

const HEADER_TITLE: Record<string, string> = {
  "/": "NAVI",
  "/login": "로그인",
  "/graduation": "졸업 관리",
  "/my": "마이",
};

/** /splash: 헤더·프레임 없음. 그 외: 앱 프레임 + 헤더 + (하단바 경로면 채팅입력·하단 바) */
export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSplash = pathname === "/splash";
  const showBottomBar = !isSplash && pathname !== "/login";
  const showHeader = !isSplash;
  const headerTitle = HEADER_TITLE[pathname] ?? "NAVI";

  if (isSplash) {
    return <>{children}</>;
  }

  return (
    <div className="app-frame flex h-full min-h-0 flex-col overflow-hidden">
      {showHeader && (
        <AppHeader
          title={headerTitle}
          showBack={pathname !== "/"}
          showTitle={pathname !== "/"}
        />
      )}
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
      {showBottomBar && (
        <>
          <ChatInput />
          <BottomBar />
        </>
      )}
    </div>
  );
}
