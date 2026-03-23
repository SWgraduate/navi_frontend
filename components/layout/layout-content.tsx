"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { EditIcon, ScanIcon } from "@/components/icons/header-icons";
import { AppHeader } from "@/components/layout/app-header";
import { BottomBar } from "@/components/layout/bottom-bar";
import { ChatInput } from "@/components/layout/chat-input";
import { useChat } from "@/contexts/chat-context";
import { useKeyboardStatus } from "@/hooks/use-keyboard-status";
import { withViewTransition } from "@/lib/view-transition";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const HEADER_TITLE_KEYS: Record<string, string> = {
  "/home": "header.home",
  "/speak": "header.speak",
  "/login": "header.login",
  "/signup": "header.signup",
  "/graduation": "header.graduation",
  "/graduation/upload": "header.graduationUpload",
  "/graduation/upload/processing": "header.graduationUpload",
  "/graduation/result": "header.graduationResult",
  "/graduation/timetable-scan": "header.graduationTimetableScan",
  "/graduation/timetable-scan/processing": "header.graduationTimetableScan",
  "/my": "header.my",
  "/my/terms": "header.myTerms",
  "/my/language": "header.myLanguage",
  "/my/personal": "header.myPersonal",
  "/my/personal/name": "header.myPersonalName",
  "/my/personal/student-id": "header.myPersonalStudentId",
  "/my/personal/major": "header.myPersonalMajor",
  "/my/personal/second-major": "header.myPersonalSecondMajor",
  "/my/personal/academic-status": "header.myPersonalAcademicStatus",
  "/my/personal/year-semester": "header.myPersonalYearSemester",
  "/history": "header.history",
};

const ROUTES_WITH_BOTTOM_BAR = ["/home", "/graduation", "/my"] as const;
const SKIP_SAVED_RESULT_KEY = "navi_skip_saved_graduation_result_once";

function pathHasBottomBar(pathname: string): boolean {
  return ROUTES_WITH_BOTTOM_BAR.some((route) => {
    if (route === "/home" || route === "/my") return pathname === route;
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

function AppHeaderWithSearchParams({
  pathname,
  isLoginPage,
  isSignupPage,
  isGraduationHeaderWithIcons,
  isHistoryPage,
  isGraduationUploadPage,
  isGraduationProcessingPage,
  isGraduationResultPage,
  isGraduationTimetableScanPage,
  scrolled,
  router,
  startNewChat,
  setScanMenuOpen,
}: {
  pathname: string;
  isLoginPage: boolean;
  isSignupPage: boolean;
  isGraduationHeaderWithIcons: boolean;
  isHistoryPage: boolean;
  isGraduationUploadPage: boolean;
  isGraduationProcessingPage: boolean;
  isGraduationResultPage: boolean;
  isGraduationTimetableScanPage: boolean;
  scrolled: boolean;
  router: ReturnType<typeof useRouter>;
  startNewChat: () => void;
  setScanMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}) {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const headerTitle =
    pathname === "/signup/terms/service"
      ? t("header.termsService")
      : pathname === "/signup/terms/privacy-policy"
        ? t("header.termsPrivacyPolicy")
        : pathname === "/signup/terms/privacy"
          ? t("header.termsPrivacy")
          : pathname === "/signup/terms/ai"
          ? t("header.termsAi")
          : pathname === "/signup/terms/marketing"
            ? t("header.termsMarketing")
            : pathname.startsWith("/signup/terms")
              ? t("header.termsAgree")
              : pathname === "/signup" || pathname.startsWith("/signup/")
                ? t("header.signup")
                : pathname === "/graduation/upload/processing" && searchParams.get("edit")
                  ? t("header.edit")
                  : t(HEADER_TITLE_KEYS[pathname] ?? "header.home");

  const isMySection = pathname === "/my" || pathname.startsWith("/my/");
  const handleBack =
    isGraduationResultPage
      ? () => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(SKIP_SAVED_RESULT_KEY, "1");
          }
          withViewTransition(() => router.replace("/graduation"));
        }
      : undefined;

  return (
    <AppHeader
      title={headerTitle}
      showBack={
        pathname !== "/home" &&
        pathname !== "/my" &&
        !isLoginPage &&
        !isGraduationResultPage
      }
      onBack={handleBack}
      showTitle={pathname !== "/home" && pathname !== "/my" && !isGraduationHeaderWithIcons}
      showHistory={
        !isHistoryPage &&
        !isLoginPage &&
        !isSignupPage &&
        !isMySection &&
        (isGraduationHeaderWithIcons || (!isGraduationUploadPage && !isGraduationProcessingPage && !isGraduationTimetableScanPage))
      }
      showAdd={
        !isHistoryPage &&
        !isLoginPage &&
        !isSignupPage &&
        !isMySection &&
        (isGraduationHeaderWithIcons || (!isGraduationUploadPage && !isGraduationProcessingPage && !isGraduationTimetableScanPage))
      }
      historyIcon={
        isGraduationHeaderWithIcons ? <EditIcon /> : undefined
      }
      addIcon={
        isGraduationHeaderWithIcons ? <ScanIcon /> : undefined
      }
      scrolled={scrolled}
      onHistory={
        isGraduationResultPage
          ? () => withViewTransition(() => router.push("/graduation/upload/processing?edit=1"))
          : isGraduationUploadPage || isGraduationProcessingPage
            ? () => withViewTransition(() => router.push("/history"))
            : !isHistoryPage
              ? () => withViewTransition(() => router.push("/history"))
              : undefined
      }
      onAdd={
        isGraduationHeaderWithIcons
          ? () => setScanMenuOpen((open) => !open)
          : !isHistoryPage
              ? () => {
                  startNewChat();
                  withViewTransition(() => router.push("/home"));
                }
              : undefined
      }
    />
  );
}

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { startNewChat } = useChat();
  const { t } = useTranslation();
  const isHome = pathname === "/home";
  const isSplash = pathname === "/";
  const routeShowsBottomBar = pathHasBottomBar(pathname);
  const showChatInput = isHome;
  const isMyPage = pathname === "/my" || pathname.startsWith("/my/");
  const isMyPersonalPage = pathname === "/my/personal" || pathname.startsWith("/my/personal/");
  const isGraduationUploadPage = pathname === "/graduation/upload";
  const isGraduationProcessingPage = pathname === "/graduation/upload/processing";
  const isGraduationResultPage = pathname === "/graduation/result" || pathname.startsWith("/graduation/result/");
  const isGraduationTimetableScanPage = pathname === "/graduation/timetable-scan" || pathname.startsWith("/graduation/timetable-scan/");
  const isGraduationHeaderWithIcons = isGraduationResultPage;
  const isHistoryPage = pathname === "/history" || pathname.startsWith("/history/");
  const isLoginPage = pathname === "/login" || pathname.startsWith("/login/");
  const isSignupPage = pathname === "/signup" || pathname.startsWith("/signup/");
  const isGraduationRootPage = pathname === "/graduation";
  const isSignupTermsPage = pathname.startsWith("/signup/terms");
  const isSignupTermsAgreePage = pathname === "/signup";
  const isLanguageOnboardingPage = pathname === "/language-onboarding";
  const showHeader =
    !isSplash &&
    pathname !== "/my" &&
    pathname !== "/speak" &&
    !isGraduationRootPage &&
    !isLanguageOnboardingPage;
  const isWhiteBackgroundPage =
    isSplash ||
    isMyPage ||
    isGraduationUploadPage ||
    isGraduationProcessingPage ||
    isGraduationResultPage ||
    isGraduationTimetableScanPage ||
    pathname === "/speak" ||
    isSignupTermsPage ||
    isSignupTermsAgreePage ||
    isLoginPage ||
    isLanguageOnboardingPage ||
    isHistoryPage;

  const [chatInputFocused, setChatInputFocused] = useState(false);
  const [scanMenuOpen, setScanMenuOpen] = useState(false);
  const { isKeyboardOpen, keyboardHeight } = useKeyboardStatus();

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

  useEffect(() => {
    const t = setTimeout(() => setScanMenuOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  // 마이·result 페이지: body·html·노치 영역까지 흰색 (모바일에서 회색으로 보이는 것 방지)
  useEffect(() => {
    if (!isWhiteBackgroundPage) return;
    const prevBody = document.body.style.background;
    const prevHtml = document.documentElement.style.background;
    document.body.style.background = "white";
    document.documentElement.style.background = "white";
    return () => {
      document.body.style.background = prevBody;
      document.documentElement.style.background = prevHtml;
    };
  }, [isWhiteBackgroundPage]);

  const keyboardActive = chatInputFocused || isKeyboardOpen || keyboardHeight > 0;
  const showBottomBar =
    !isSplash &&
    routeShowsBottomBar &&
    !isMyPersonalPage &&
    !isGraduationTimetableScanPage &&
    !keyboardActive &&
    !isGraduationUploadPage &&
    !isGraduationProcessingPage;

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const focused = isFocusableInput(e.target);
      // iOS Safari: 입력 포커스 시 window를 자동 스크롤하는 현상 즉시 차단
      if (focused) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
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
      // iOS Safari가 키보드 열릴 때 window를 스크롤하는 것을 rAF 타이밍에서도 차단
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
      // Home에서 키보드 열리면 mainHeight transition(220ms) 완료 후 마지막 메시지로 스크롤
      if (isHome) {
        recoveryTimeoutIdsRef.current.push(
          window.setTimeout(() => {
            if (!previousKeyboardActiveRef.current) return; // 이미 닫혔으면 무시
            const mainEl = mainRef.current;
            if (mainEl) mainEl.scrollTop = mainEl.scrollHeight;
          }, 240)
        );
      }
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

      // Home은 항상 맨 아래로 (채팅 UX), 다른 페이지는 저장된 위치로 복원
      mainEl.scrollTop = isHome ? mainEl.scrollHeight : savedMainScrollTopRef.current;
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
  }, [keyboardActive, isHome]);

  useEffect(() => {
    return () => {
      recoveryTimeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      recoveryTimeoutIdsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!showHeader) return;

    const wrapperEl = headerRef.current;
    if (!wrapperEl) return;

    const updateHeaderHeight = () => {
      // fixed 헤더는 wrapper에서 공간을 차지하지 않으므로, 실제 header 요소를 측정
      const headerEl = wrapperEl.querySelector("header") as HTMLElement | null;
      const height = headerEl?.offsetHeight ?? 0;
      setHeaderHeight(height);
    };

    updateHeaderHeight();
    // pathname 변경 후 DOM 업데이트 대기 (클라이언트 네비게이션 시 헤더 겹침 방지)
    const retryId = setTimeout(updateHeaderHeight, 0);
    const retryId2 = setTimeout(updateHeaderHeight, 100);
    window.addEventListener("resize", updateHeaderHeight);

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateHeaderHeight);
      resizeObserver.observe(wrapperEl);
      const headerEl = wrapperEl.querySelector("header");
      if (headerEl) resizeObserver.observe(headerEl);
      return () => {
        clearTimeout(retryId);
        clearTimeout(retryId2);
        window.removeEventListener("resize", updateHeaderHeight);
        resizeObserver.disconnect();
      };
    }

    return () => {
      clearTimeout(retryId);
      clearTimeout(retryId2);
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [showHeader, pathname]);

  useEffect(() => {
    // 하단바가 숨겨지면 높이를 0으로 설정 (비동기로 처리해 set-state-in-effect 규칙 준수)
    if (!showBottomBar) {
      const t = setTimeout(() => setBottomBarHeight(0), 0);
      return () => clearTimeout(t);
    }

    const updateBottomBarHeight = () => {
      const bottomBarEl = document.querySelector("[data-bottom-bar] nav") as HTMLElement | null;
      if (bottomBarEl) {
        setBottomBarHeight(bottomBarEl.offsetHeight);
      } else {
        // 하단바 요소가 없으면 기본값 사용
        setBottomBarHeight(60);
      }
    };

    // 약간의 지연을 두어 DOM이 업데이트된 후 측정
    const timeoutId = setTimeout(updateBottomBarHeight, 0);
    window.addEventListener("resize", updateBottomBarHeight);

    const bottomBarEl = document.querySelector("[data-bottom-bar] nav") as HTMLElement | null;
    if (bottomBarEl && typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateBottomBarHeight);
      resizeObserver.observe(bottomBarEl);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", updateBottomBarHeight);
        resizeObserver.disconnect();
      };
    }

    return () => {
      clearTimeout(timeoutId);
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
    // 졸업관리 루트 페이지는 bottomBar를 main 높이에 포함 (paddingBottom 없으므로)
    const bottomInset = isGraduationRootPage && showBottomBar ? bottomBarHeight : 0;
    return Math.max(0, effectiveViewportHeight - topInset - bottomInset);
  }, [effectiveViewportHeight, headerHeight, showHeader, isGraduationRootPage, showBottomBar, bottomBarHeight]);

  const resolvedPaddingTop = showHeader
    ? headerHeight > 0
      ? `${headerHeight}px`
      : "calc(3rem + 1rem + var(--safe-area-inset-top))"
    : "0px";

  const resolvedPaddingBottom = useMemo(() => {
    // 졸업관리 루트 페이지는 중앙 정렬을 위해 paddingBottom 제거
    if (isGraduationRootPage) {
      return "0px";
    }

    if (keyboardActive) {
      return "0px";
    }

    if (showChatInput) {
      return `${Math.max(chatInputHeight, 112) + (showBottomBar ? bottomBarHeight : 0)}px`;
    }

    if (showBottomBar) return `${bottomBarHeight}px`;
    return "var(--safe-area-inset-bottom)";
  }, [bottomBarHeight, chatInputHeight, keyboardActive, showBottomBar, showChatInput, isGraduationRootPage]);

  if (isSplash) {
    return <>{children}</>;
  }

  return (
    <div
      className="app-frame flex h-full min-h-0 flex-col overflow-hidden"
      style={isWhiteBackgroundPage ? { background: "white" } : undefined}
    >
      {showHeader && (
        <div ref={headerRef}>
          <Suspense fallback={<AppHeader title="NAVI" showBack={pathname !== "/home" && pathname !== "/my" && !isLoginPage} showTitle={pathname !== "/home" && pathname !== "/my" && !isGraduationHeaderWithIcons} showHistory={false} showAdd={false} scrolled={scrolled} />}>
            <AppHeaderWithSearchParams
              pathname={pathname}
              isLoginPage={isLoginPage}
              isSignupPage={isSignupPage}
              isGraduationHeaderWithIcons={isGraduationHeaderWithIcons}
              isHistoryPage={isHistoryPage}
              isGraduationUploadPage={isGraduationUploadPage}
              isGraduationProcessingPage={isGraduationProcessingPage}
              isGraduationResultPage={isGraduationResultPage}
              isGraduationTimetableScanPage={isGraduationTimetableScanPage}
              scrolled={scrolled}
              router={router}
              startNewChat={startNewChat}
              setScanMenuOpen={setScanMenuOpen}
            />
          </Suspense>
        </div>
      )}

      <main
        ref={mainRef}
        onScroll={onScroll}
        tabIndex={-1}
        className={`min-h-0 flex-1 overflow-x-hidden focus:outline-none${isGraduationRootPage ? " flex items-center justify-center" : ""}${isSignupTermsPage || isSignupTermsAgreePage ? " overflow-y-hidden" : " overflow-y-auto"}`}
        suppressHydrationWarning
        style={{
          height: mainHeight != null ? `${mainHeight}px` : undefined,
          maxHeight: mainHeight != null ? `${mainHeight}px` : undefined,
          paddingTop: resolvedPaddingTop,
          paddingBottom: resolvedPaddingBottom,
          transition: "height 220ms ease, max-height 220ms ease, padding-bottom 220ms ease",
          touchAction: isGraduationRootPage || isSignupTermsPage || isSignupTermsAgreePage ? "none" : "pan-y",
          WebkitOverflowScrolling: isGraduationRootPage || isSignupTermsPage || isSignupTermsAgreePage ? "auto" : "touch",
          overflowY: isGraduationRootPage || isSignupTermsPage || isSignupTermsAgreePage ? "hidden" : "scroll",
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
          onSpeakClick={() => withViewTransition(() => router.push("/speak"))}
          isKeyboardOpen={keyboardActive}
          keyboardHeight={effectiveKeyboardInset}
          bottomBarHeight={bottomBarHeight}
        />
      )}
      {showBottomBar && (
        <div data-bottom-bar>
          <BottomBar />
        </div>
      )}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isGraduationResultPage && scanMenuOpen && (
              <>
                <motion.div
                  role="presentation"
                  className="fixed inset-0 z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setScanMenuOpen(false)}
                />
                <motion.div
                  role="menu"
                  aria-label="스캔 메뉴"
                  className="fixed right-1 z-50 flex flex-col items-stretch rounded-lg border border-[#EEEFF1] bg-white py-1 shadow-ds-soft"
                  style={{ top: "calc(3rem + 0.5rem + var(--safe-area-inset-top))" }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="whitespace-nowrap px-4 py-3 text-left text-ds-body-16-r text-ds-primary hover:bg-ds-tertiary/10 active:bg-ds-tertiary/15"
                    onClick={() => {
                      setScanMenuOpen(false);
                      withViewTransition(() => router.push("/graduation/upload"));
                    }}
                  >
                    {t("scan.graduation")}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="whitespace-nowrap px-4 py-3 text-left text-ds-body-16-r text-ds-primary hover:bg-ds-tertiary/10 active:bg-ds-tertiary/15"
                    onClick={() => {
                      setScanMenuOpen(false);
                      withViewTransition(() => router.push("/graduation/timetable-scan"));
                    }}
                  >
                    {t("scan.schedule")}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
