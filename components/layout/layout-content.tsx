"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { BottomBar } from "@/components/layout/bottom-bar";
import { ChatInput } from "@/components/layout/chat-input";

const HEADER_TITLE: Record<string, string> = {
  "/": "NAVI",
  "/login": "로그인",
  "/graduation": "졸업 관리",
  "/my": "마이",
};

/** 하단 바를 켜는 경로. 추가/제거로 페이지별 on/off */
const ROUTES_WITH_BOTTOM_BAR = ["/", "/graduation", "/my"] as const;

function pathHasBottomBar(pathname: string): boolean {
  return ROUTES_WITH_BOTTOM_BAR.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(route + "/");
  });
}

function isFocusableInput(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return true;
  return el.getAttribute("contenteditable") === "true";
}

/** /splash: 헤더·프레임 없음. 그 외: 앱 프레임 + 헤더 + (경로·키보드에 따라 하단 바 on/off) */
export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSplash = pathname === "/splash";
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const onFocus = (e: FocusEvent) => setInputFocused(isFocusableInput(e.target));
    const onBlur = () => setInputFocused(false);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
    };
  }, []);

  const routeShowsBottomBar = pathHasBottomBar(pathname);
  const showBottomBar =
    !isSplash && routeShowsBottomBar && !inputFocused;

  const showChatInput = pathname === "/";
  const isMyPage = pathname === "/my" || pathname.startsWith("/my/");
  const showHeader = !isSplash && !isMyPage;
  const headerTitle = HEADER_TITLE[pathname] ?? "NAVI";

  const mainRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const onScroll = useCallback(() => {
    const el = mainRef.current;
    setScrolled(el ? el.scrollTop > 0 : false);
  }, []);

  if (isSplash) {
    return <>{children}</>;
  }

  return (
    <div className="app-frame flex h-full min-h-0 flex-col overflow-hidden">
      {showHeader && (
        <AppHeader
          title={headerTitle}
          showBack={pathname !== "/" && pathname !== "/my"}
          showTitle={pathname !== "/" && pathname !== "/my"}
          showHistory={pathname !== "/my"}
          showAdd={pathname !== "/my"}
          scrolled={scrolled}
        />
      )}
      <main
        ref={mainRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        {children}
      </main>
      {showChatInput && <ChatInput />}
      {showBottomBar && <BottomBar />}
    </div>
  );
}
