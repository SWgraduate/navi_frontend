"use client";

import { Pin, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HistoryItemPopoverProps {
  /** 팝오버 좌표 (뷰포트 기준) */
  x: number;
  y: number;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 고정 클릭 */
  onPin?: () => void;
  /** 이름 변경 클릭 */
  onRename?: () => void;
  /** 삭제 클릭 */
  onDelete?: () => void;
  className?: string;
}

const ITEM_CLASS =
  "flex w-full items-center gap-2 px-3 py-2.5 text-left text-ds-caption-14-r leading-ds-caption-14-r text-ds-gray-90 active:bg-ds-gray-5 first:rounded-t-lg last:rounded-b-lg";

/**
 * Figma 1192-11416: 히스토리 항목 롱프레스 시 나타나는 컨텍스트 메뉴 (고정 / 이름 변경 / 삭제)
 */
export function HistoryItemPopover({
  x,
  y,
  onClose,
  onPin,
  onRename,
  onDelete,
  className,
}: HistoryItemPopoverProps) {
  const handleAction = (fn: (() => void) | undefined) => {
    fn?.();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        aria-hidden
        onClick={onClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        role="menu"
        className={cn(
          "fixed z-50 w-[136px] max-w-[calc(100vw-24px)] rounded-lg bg-white py-1 shadow-ds-soft",
          className
        )}
        style={{
          left: Math.min(x, typeof window !== "undefined" ? window.innerWidth - 148 : x),
          top: y + 8,
        }}
      >
        {onPin != null && (
          <button
            type="button"
            role="menuitem"
            className={ITEM_CLASS}
            onClick={() => handleAction(onPin)}
          >
            <Pin className="shrink-0 text-ds-tertiary" style={{ width: 24, height: 24 }} />
            고정
          </button>
        )}
        {onRename != null && (
          <button
            type="button"
            role="menuitem"
            className={ITEM_CLASS}
            onClick={() => handleAction(onRename)}
          >
            <Pencil className="shrink-0 text-ds-tertiary" style={{ width: 24, height: 24 }} />
            이름 변경
          </button>
        )}
        {onDelete != null && (
          <button
            type="button"
            role="menuitem"
            className={ITEM_CLASS}
            onClick={() => handleAction(onDelete)}
          >
            <Trash2 className="shrink-0 text-ds-tertiary" style={{ width: 24, height: 24 }} />
            삭제
          </button>
        )}
      </div>
    </>
  );
}
