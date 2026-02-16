"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { BottomBar } from "@/components/layout/bottom-bar";
import { ChatInput } from "@/components/layout/chat-input";
import { useChat } from "@/contexts/chat-context";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { withViewTransition } from "@/lib/view-transition";

const HEADER_TITLE: Record<string, string> = {
  "/": "NAVI",
  "/login": "로그인",
  "/graduation": "졸업 관리",
  "/my": "마이",
  "/history": "기록",
};

const ROUTES_WITH_BOTTOM_BAR = ["/", "/graduation", "/my"] as const;

function pathHasBottomBar(pathname: string): boolean {
  return ROUTES_WITH_BOTTOM_BAR.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(route + "/");
  });
}

function isFocusableInput(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return true;
  return el.isContentEditable || el.getAttribute("contenteditable") === "true";
}

function isInsideChatInput(el: Element | null): boolean {
  return el?.closest("[data-chat-input]") != null;
}

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { startNewChat } = useChat();
  const isHome = pathname === "/";
  const isSplash = pathname === "/splash";
  const routeShowsBottomBar = pathHasBottomBar(pathname);
  const showChatInput = isHome;
  const isMyPage = pathname === "/my" || pathname.startsWith("/my/");
  const isGraduationPage = pathname === "/graduation" || pathname.startsWith("/graduation/");
  const isHistoryPage = pathname === "/history" || pathname.startsWith("/history/");
  const isLoginPage = pathname === "/login" || pathname.startsWith("/login/");
  const showHeader = !isSplash && !isMyPage && !isGraduationPage;

  const [chatInputFocused, setChatInputFocused] = useState(false);
  const { isKeyboardOpen, keyboardHeight } = useKeyboardStatus();
  const headerTitle = HEADER_TITLE[pathname] ?? "NAVI";

  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [windowHeight, setWindowHeight] = useState<number | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [chatInputHeight, setChatInputHeight] = useState(112);
  const [bottomBarHeight, setBottomBarHeight] = useState(0);
  const previousKeyboardActiveRef = useRef(false);
  const savedMainScrollTopRef = useRef(0);
  const recoveryTimeoutIdsRef = useRef<number[]>([]);

  const baseWindowHeight = useMemo(() => {
    if (typeof window === "undefined") return null;
    return windowHeight ?? window.innerHeight;
  }, [windowHeight]);

  const effectiveKeyboardInset = Math.max(0, keyboardHeight);

  const keyboardActive = chatInputFocused || isKeyboardOpen || keyboardHeight > 0;
  const showBottomBar = !isSplash && routeShowsBottomBar && !keyboardActive;

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const focused = isFocusableInput(e.target);
      setChatInputFocused(focused && e.target instanceof Element && isInsideChatInput(e.target));
    };
    const onBlur = () => {
      // 입력 요소 간 포커스 이동 시 false flicker 방지
      window.setTimeout(() => {
        const activeElement = document.activeElement;
        const focused = isFocusableInput(activeElement);
        setChatInputFocused(focused && activeElement instanceof Element && isInsideChatInput(activeElement));
      }, 0);
    };

    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);

    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
    };
  }, []);

  const onScroll = useCallback(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;
    setScrolled(mainEl.scrollTop > 0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateViewportMetrics = () => {
      setWindowHeight(window.innerHeight);
    };

    updateViewportMetrics();
    window.addEventListener("resize", updateViewportMetrics);
    window.addEventListener("orientationchange", updateViewportMetrics);

    return () => {
      window.removeEventListener("resize", updateViewportMetrics);
      window.removeEventListener("orientationchange", updateViewportMetrics);
    };
  }, []);

  useEffect(() => {
    const clearRecoveryTimers = () => {
      recoveryTimeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      recoveryTimeoutIdsRef.current = [];
    };

    const wasKeyboardActive = previousKeyboardActiveRef.current;
    previousKeyboardActiveRef.current = keyboardActive;

    if (keyboardActive) {
      clearRecoveryTimers();
    }

    if (!wasKeyboardActive && keyboardActive) {
      savedMainScrollTopRef.current = mainRef.current?.scrollTop ?? 0;
      return;
    }

    if (!(wasKeyboardActive && !keyboardActive)) return;

    const restoreViewportAndFocus = () => {
      // 닫힘 복구 타이머가 늦게 실행되어 재오픈을 깨뜨리지 않도록 가드.
      if (previousKeyboardActiveRef.current) return;

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const mainEl = mainRef.current;
      if (!mainEl) return;

      mainEl.scrollTop = savedMainScrollTopRef.current;
    };

    clearRecoveryTimers();

    restoreViewportAndFocus();
    requestAnimationFrame(() => {
      restoreViewportAndFocus();
      requestAnimationFrame(restoreViewportAndFocus);
    });

    const retryDelays = isIOSSafari() ? [40, 100, 180, 280] : [80, 160];
    retryDelays.forEach((delay) => {
      recoveryTimeoutIdsRef.current.push(window.setTimeout(restoreViewportAndFocus, delay));
    });
  }, [keyboardActive]);

  useEffect(() => {
    return () => {
      recoveryTimeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      recoveryTimeoutIdsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!showHeader) return;

    const headerEl = headerRef.current;
    if (!headerEl) return;

    const updateHeaderHeight = () => {
      setHeaderHeight(headerEl.offsetHeight);
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateHeaderHeight);
      resizeObserver.observe(headerEl);
      return () => {
        window.removeEventListener("resize", updateHeaderHeight);
        resizeObserver.disconnect();
      };
    }

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [showHeader]);

  useEffect(() => {
    const updateBottomBarHeight = () => {
      const bottomBarEl = document.querySelector("[data-bottom-bar] nav") as HTMLElement | null;
      if (bottomBarEl) {
        setBottomBarHeight(bottomBarEl.offsetHeight);
      } else {
        setBottomBarHeight(showBottomBar ? 60 : 0);
      }
    };

    updateBottomBarHeight();
    window.addEventListener("resize", updateBottomBarHeight);

    const bottomBarEl = document.querySelector("[data-bottom-bar] nav") as HTMLElement | null;
    if (bottomBarEl && typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateBottomBarHeight);
      resizeObserver.observe(bottomBarEl);
      return () => {
        window.removeEventListener("resize", updateBottomBarHeight);
        resizeObserver.disconnect();
      };
    }

    return () => {
      window.removeEventListener("resize", updateBottomBarHeight);
    };
  }, [showBottomBar, pathname]);

  const onChatInputHeightChange = useCallback((height: number) => {
    setChatInputHeight((prev) => (prev === height ? prev : height));
  }, []);

  const keyboardOccupiedHeight = keyboardActive ? effectiveKeyboardInset : 0;
  const chatInputOccupiedHeight =
    showChatInput && keyboardActive ? Math.max(chatInputHeight, 112) : 0;

  const effectiveViewportHeight = useMemo(() => {
    if (baseWindowHeight == null) return null;
    return Math.max(
      0,
      baseWindowHeight - keyboardOccupiedHeight - chatInputOccupiedHeight
    );
  }, [baseWindowHeight, chatInputOccupiedHeight, keyboardOccupiedHeight]);

  const mainHeight = useMemo(() => {
    if (effectiveViewportHeight == null) return undefined;
    const topInset = showHeader ? headerHeight : 0;
    // 졸업관리 페이지는 bottomBar를 main 높이에 포함 (paddingBottom 없으므로)
    const bottomInset = isGraduationPage && showBottomBar ? bottomBarHeight : 0;
    return Math.max(0, effectiveViewportHeight - topInset - bottomInset);
  }, [effectiveViewportHeight, headerHeight, showHeader, isGraduationPage, showBottomBar, bottomBarHeight]);

  const resolvedPaddingTop = showHeader
    ? headerHeight > 0
      ? `${headerHeight}px`
      : "calc(3rem + 1rem + var(--safe-area-inset-top))"
    : "0px";

  const resolvedPaddingBottom = useMemo(() => {
    // 졸업관리 페이지는 중앙 정렬을 위해 paddingBottom 제거
    if (isGraduationPage) {
      return "0px";
    }

    if (keyboardActive) {
      return "0px";
    }

    if (showChatInput) {
      return `${Math.max(chatInputHeight, 112) + (showBottomBar ? bottomBarHeight : 0)}px`;
    }

    if (showBottomBar) return `${bottomBarHeight}px`;
    return "0px";
  }, [bottomBarHeight, chatInputHeight, keyboardActive, showBottomBar, showChatInput, isGraduationPage]);

  if (isSplash) {
    return <>{children}</>;
  }

  return (
    <div className="app-frame flex h-full min-h-0 flex-col overflow-hidden">
      {showHeader && (
        <div ref={headerRef}>
          <AppHeader
            title={headerTitle}
            showBack={pathname !== "/" && pathname !== "/my"}
            showTitle={pathname !== "/" && pathname !== "/my"}
            showHistory={!isHistoryPage && !isLoginPage && pathname !== "/my"}
            showAdd={!isHistoryPage && !isLoginPage && pathname !== "/my"}
            scrolled={scrolled}
            onHistory={
              !isHistoryPage
                ? () => {
                    withViewTransition(() => router.push("/history"));
                  }
                : undefined
            }
            onAdd={
              !isHistoryPage
                ? () => {
                    startNewChat();
                    withViewTransition(() => router.push("/"));
                  }
                : undefined
            }
          />
        </div>
      )}

      <main
        ref={mainRef}
        onScroll={onScroll}
        tabIndex={-1}
        className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden focus:outline-none${isGraduationPage ? " flex items-center justify-center" : ""}`}
        suppressHydrationWarning
        style={{
          height: mainHeight != null ? `${mainHeight}px` : undefined,
          maxHeight: mainHeight != null ? `${mainHeight}px` : undefined,
          paddingTop: resolvedPaddingTop,
          paddingBottom: resolvedPaddingBottom,
          transition: "height 220ms ease, max-height 220ms ease, padding-bottom 220ms ease",
          touchAction: isGraduationPage ? "none" : "pan-y", // 졸업관리 페이지는 스크롤 비활성화
          WebkitOverflowScrolling: isGraduationPage ? "auto" : "touch", // iOS 부드러운 스크롤
          overflowY: isGraduationPage ? "hidden" : "scroll", // 졸업관리 페이지는 스크롤 비활성화
          overflowX: "hidden",
          position: "relative", // 스크롤 컨테이너로 명확히 지정
          background: "var(--header-bg, var(--background))", // 페이지에서 설정한 헤더 배경색을 main도 따라감
        }}
      >
        {children}
      </main>

      {showChatInput && (
        <ChatInput
          onHeightChange={onChatInputHeightChange}
          isKeyboardOpen={isKeyboardOpen}
          keyboardHeight={effectiveKeyboardInset}
        />
      )}
      {showBottomBar && (
        <div data-bottom-bar>
          <BottomBar />
        </div>
      )}
    </div>
  );
}
