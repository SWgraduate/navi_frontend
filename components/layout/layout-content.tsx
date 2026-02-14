"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { BottomBar } from "@/components/layout/bottom-bar";
import { ChatInput } from "@/components/layout/chat-input";
import { cn } from "@/lib/utils";

/** /splash: 헤더·프레임 없음. /login: 앱 프레임 + 헤더. 그 외: 앱 프레임 + 채팅 입력창 + 하단 바 */
export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSplash = pathname === "/splash";
  const isLogin = pathname === "/login";
  const showBottomBar = !isSplash && !isLogin;

  if (isSplash) {
    return <>{children}</>;
  }

  return (
    <div className="app-frame flex min-h-dvh flex-col">
      {isLogin && <AppHeader title="로그인" />}
      <div
        className={cn(
          "min-h-0 flex-1",
          showBottomBar &&
            "pb-[calc(var(--safe-area-inset-bottom)+3.5rem+3.5rem)]"
        )}
      >
        {children}
      </div>
      {showBottomBar && (
        <>
          <ChatInput />
          <BottomBar />
        </>
      )}
    </div>
  );
}
