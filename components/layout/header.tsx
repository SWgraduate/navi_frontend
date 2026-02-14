"use client";

import * as React from "react";
import { ArrowLeft, RotateCcw, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 16×16 (디자인 시스템) */
const iconSize = "size-4";

export interface HeaderProps {
  /** 중앙 타이틀 (예: 로그인) */
  title: string;
  /** 뒤로가기 클릭 (없으면 뒤로 버튼 미표시) */
  onBack?: () => void;
  /** 오른쪽: 히스토리/새로고침 버튼 클릭 */
  onHistory?: () => void;
  /** 오른쪽: 추가 버튼 클릭 */
  onAdd?: () => void;
  /** 오른쪽 영역 커스텀 (onHistory, onAdd 대신 사용) */
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * 06 Header – Navi 디자인 시스템 헤더.
 * 좌: 뒤로가기 | 중앙: 타이틀 | 우: 히스토리, 추가
 */
function Header({
  title,
  onBack,
  onHistory,
  onAdd,
  rightSlot,
  className,
}: HeaderProps) {
  const hasRight = rightSlot != null || onHistory != null || onAdd != null;

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex min-h-12 items-center justify-between gap-2 border-b border-border bg-background px-2",
        className
      )}
      style={{ paddingTop: "calc(0.5rem + var(--safe-area-inset-top))", paddingBottom: "0.5rem" }}
    >
      <div className="flex min-w-10 items-center justify-start">
        {onBack != null ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="뒤로"
            className="shrink-0 bg-transparent hover:bg-transparent active:opacity-70"
          >
            <ArrowLeft className={iconSize} />
          </Button>
        ) : (
          <span className="w-10" aria-hidden />
        )}
      </div>

      <h1
        className={cn(
          "flex-1 truncate text-center text-ds-title font-semibold leading-none text-foreground"
        )}
      >
        {title}
      </h1>

      <div className="flex min-w-10 items-center justify-end gap-0">
        {rightSlot != null ? (
          rightSlot
        ) : hasRight ? (
          <>
            {onHistory != null && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onHistory}
                aria-label="히스토리"
                className="shrink-0 bg-transparent hover:bg-transparent active:opacity-70"
              >
                <RotateCcw className={iconSize} />
              </Button>
            )}
            {onAdd != null && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdd}
                aria-label="추가"
                className="shrink-0 bg-transparent hover:bg-transparent active:opacity-70"
              >
                <SquarePlus className={iconSize} />
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
