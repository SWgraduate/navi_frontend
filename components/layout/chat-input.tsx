"use client";

import * as React from "react";
import Image from "next/image";
import { VoiceModeButton } from "@/components/ui/icon-buttons";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/chat-context";

export interface ChatInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string;
  onAttachClick?: () => void;
  onSpeakClick?: () => void;
  onHeightChange?: (height: number) => void;
  isKeyboardOpen?: boolean;
  keyboardHeight?: number;
  bottomBarHeight?: number;
}

/** Figma 1136-9535: 하단 바 바로 위. 바=BG/Surface, 입력창=흰색(BG/Default) 한 덩어리, 높이 타이트 */
function ChatInput({
  className,
  onAttachClick,
  onSpeakClick,
  onHeightChange,
  isKeyboardOpen = false,
  keyboardHeight = 0,
  bottomBarHeight = 0,
  ...inputProps
}: ChatInputProps) {
  const { sendMessage } = useChat();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState("");

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

  const shouldDockToKeyboard = isKeyboardOpen || keyboardHeight > 0;

  const effectiveKeyboardInset = Math.max(0, Math.round(keyboardHeight));

  const resolvedBottomValue = shouldDockToKeyboard
    ? `${effectiveKeyboardInset}px`
    : bottomBarHeight > 0
      ? `calc(${bottomBarHeight}px + var(--safe-area-inset-bottom))`
      : `calc(120px + var(--safe-area-inset-bottom))`;

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
    // 키보드를 닫지 않고 포커스 유지
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
          ref={inputRef}
          type="text"
          placeholder="무엇이든 물어보세요."
          className="w-full bg-transparent pb-4 text-base text-foreground placeholder:text-ds-tertiary focus:outline-none"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
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
