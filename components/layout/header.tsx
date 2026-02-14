"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { LeftIcon, HistoryIcon, NewChatIcon } from "@/components/icons/header-icons";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  /** [좌] 뒤로가기 버튼 노출 */
  showBack?: boolean;
  /** [좌] 뒤로가기 클릭 핸들러 (showBack이 true일 때 사용) */
  onBack?: () => void;
  /** [중] 타이틀 영역 노출 */
  showTitle?: boolean;
  /** [중] 타이틀 텍스트 */
  title?: string;
  /** [우] 히스토리 버튼 노출 */
  showHistory?: boolean;
  /** [우] 히스토리 클릭 핸들러 */
  onHistory?: () => void;
  /** [우] 추가 버튼 노출 */
  showAdd?: boolean;
  /** [우] 추가 클릭 핸들러 */
  onAdd?: () => void;
  /** [우] 커스텀 영역 (지정 시 showHistory/showAdd/onHistory/onAdd 무시) */
  rightSlot?: React.ReactNode;
  /** 스크롤 시 하단에 디자인 시스템 쉐도우 적용 (--ds-shadow-soft) */
  scrolled?: boolean;
  className?: string;
}

/**
 * 06 Header – Navi 디자인 시스템 헤더.
 * [좌] 뒤로가기 | [중] 타이틀 | [우] 히스토리, 추가 — 각각 on/off 가능
 */
function Header({
  showBack = true,
  onBack,
  showTitle = true,
  title = "",
  showHistory = true,
  onHistory,
  showAdd = true,
  onAdd,
  rightSlot,
  scrolled = false,
  className,
}: HeaderProps) {
  const showLeft = showBack && onBack != null;
  const showCenter = showTitle && title !== "";
  const hasRightSlot = rightSlot != null;
  const showRightFirst = !hasRightSlot && showHistory && onHistory != null;
  const showRightSecond = !hasRightSlot && showAdd && onAdd != null;
  const showRight = hasRightSlot || showRightFirst || showRightSecond;

  return (
    <header
      className={cn(
        "relative sticky top-0 z-10 flex min-h-12 items-center justify-between gap-2 bg-background px-2 transition-shadow duration-200",
        scrolled && "shadow-ds-soft",
        className
      )}
      style={{ paddingTop: "calc(0.5rem + var(--safe-area-inset-top))", paddingBottom: "0.5rem" }}
    >
      <div className="flex min-w-10 items-center justify-start">
        {showLeft ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="뒤로"
            className="shrink-0 bg-transparent hover:bg-transparent active:opacity-70"
          >
            <span className="text-[var(--ds-icon-default)] [&_svg]:!size-6 [&_svg]:!h-6 [&_svg]:!w-6">
              <LeftIcon />
            </span>
          </Button>
        ) : (
          <span className="w-10" aria-hidden />
        )}
      </div>

      {showCenter ? (
        <h1
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 max-w-[60%] -translate-x-1/2 -translate-y-1/2 truncate text-ds-title font-semibold leading-none text-[#17191C]"
          )}
        >
          {title}
        </h1>
      ) : (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden />
      )}

      <div className="flex min-w-10 items-center justify-end gap-0">
        {hasRightSlot ? (
          rightSlot
        ) : showRight ? (
          <>
            {showRightFirst && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onHistory}
                aria-label="히스토리"
                className="shrink-0 bg-transparent hover:bg-transparent active:opacity-70"
              >
                <span className="text-[var(--ds-icon-default)] [&_svg]:!size-6 [&_svg]:!h-6 [&_svg]:!w-6">
                  <HistoryIcon />
                </span>
              </Button>
            )}
            {showRightSecond && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdd}
                aria-label="추가"
                className="shrink-0 bg-transparent hover:bg-transparent active:opacity-70"
              >
                <span className="text-[var(--ds-icon-default)] [&_svg]:!size-6 [&_svg]:!h-6 [&_svg]:!w-6">
                  <NewChatIcon />
                </span>
              </Button>
            )}
          </>
        ) : (
          <span className="w-10" aria-hidden />
        )}
      </div>
    </header>
  );
}

export { Header };
