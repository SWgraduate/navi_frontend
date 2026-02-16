"use client";

import * as React from "react";
import Image from "next/image";
import { VoiceModeButton } from "@/components/ui/icon-buttons";
import { cn } from "@/lib/utils";

export interface ChatInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string;
  onAttachClick?: () => void;
  onSpeakClick?: () => void;
  onHeightChange?: (height: number) => void;
  isKeyboardOpen?: boolean;
  keyboardHeight?: number;
}

/** Figma 1136-9535: 하단 바 바로 위. 바=BG/Surface, 입력창=흰색(BG/Default) 한 덩어리, 높이 타이트 */
function ChatInput({
  className,
  onAttachClick,
  onSpeakClick,
  onHeightChange,
  isKeyboardOpen = false,
  keyboardHeight = 0,
  ...inputProps
}: ChatInputProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [bottomBarHeight, setBottomBarHeight] = React.useState(0);
  const [inputFocused, setInputFocused] = React.useState(false);

  // 하단바 높이 계산
  React.useEffect(() => {
    const updateBottomBarHeight = () => {
      const bottomBarEl = document.querySelector("[data-bottom-bar] nav") as HTMLElement | null;
      if (bottomBarEl) {
        setBottomBarHeight(bottomBarEl.offsetHeight);
      } else {
        setBottomBarHeight(0);
      }
    };

    updateBottomBarHeight();
    
    // ResizeObserver로 하단바 높이 변화 감지
    const bottomBarContainer = document.querySelector("[data-bottom-bar]") as HTMLElement | null;
    if (bottomBarContainer && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(updateBottomBarHeight);
      resizeObserver.observe(bottomBarContainer);
      return () => {
        resizeObserver.disconnect();
      };
    }
    
    // 폴백: 주기적으로 확인
    const interval = setInterval(updateBottomBarHeight, 200);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // 컨테이너 높이를 상위 레이아웃에 전달 (메인 영역 하단 여백 계산에 사용)
  React.useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl || !onHeightChange) return;

    const emitHeight = () => onHeightChange(containerEl.offsetHeight);
    emitHeight();

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(emitHeight);
      resizeObserver.observe(containerEl);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [onHeightChange]);

  // ChatInput 포커스 상태 추적: 키보드 상태 신호보다 빠르게 도킹 시작
  React.useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const handleFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      if (!containerEl.contains(event.target)) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        setInputFocused(true);
      }
    };

    const handleFocusOut = () => {
      window.setTimeout(() => {
        const activeElement = document.activeElement;
        const stillFocusedInside =
          activeElement instanceof Element &&
          containerEl.contains(activeElement) &&
          (activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement ||
            (activeElement instanceof HTMLElement && activeElement.isContentEditable));

        setInputFocused(stillFocusedInside);
      }, 0);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const shouldDockToKeyboard = inputFocused || isKeyboardOpen || keyboardHeight > 0;

  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const resolvedBottomValue = shouldDockToKeyboard
    ? `${effectiveKeyboardInset}px`
    : bottomBarHeight > 0
      ? `calc(${bottomBarHeight}px + var(--safe-area-inset-bottom))`
      : `calc(70px + var(--safe-area-inset-bottom))`;

  return (
    <div
      ref={containerRef}
      data-chat-input
      className={cn(
        "fixed left-0 right-0 z-20 shrink-0 bg-white p-4 transition-[bottom] duration-250 ease-out",
        className
      )}
      suppressHydrationWarning
      style={{
        maxWidth: "var(--app-max-width)",
        margin: "0 auto",
        bottom: resolvedBottomValue,
      }}
    >
      <div className="flex flex-col rounded-xl bg-(--ds-gray-5) p-4">
        <input
          type="text"
          placeholder="무엇이든 물어보세요."
          className="w-full bg-transparent pb-4 text-base text-foreground placeholder:text-ds-secondary focus:outline-none"
          {...inputProps}
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onAttachClick}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ds-tertiary hover:bg-(--ds-gray-10)"
            aria-label="첨부"
          >
            <Image
              src="/icons/clip.svg"
              alt=""
              width={24}
              height={24}
            />
          </button>
          <VoiceModeButton onClick={onSpeakClick} className="shrink-0" />
        </div>
      </div>
    </div>
  );
}

export { ChatInput };
