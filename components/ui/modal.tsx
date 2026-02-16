"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 모달 제목 */
  title: string;
  /** 제목 아래 설명 (선택) */
  caption?: string;
  /** 취소 버튼 텍스트. 없으면 취소 버튼 미표시 */
  cancelLabel?: string;
  /** 확인(실행) 버튼 텍스트 */
  confirmLabel?: string;
  /** 확인 버튼 클릭 시 */
  onConfirm?: () => void;
  /** 취소 버튼 클릭 시 (기본: 모달 닫기) */
  onCancel?: () => void;
  /** 확인 버튼 로딩/비활성 */
  confirmDisabled?: boolean;
  /** 확인 버튼 스타일. destructive 시 빨간 배경 (탈퇴 등) */
  confirmVariant?: "primary" | "destructive";
  /** 모달 너비. 기본 320px (모바일) */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Figma 디자인 시스템 모달 (node 1128-8710).
 * 흰 배경, 둥근 모서리, 소프트 쉐도우, Title / Caption / 취소·실행 버튼.
 */
function Modal({
  open,
  onOpenChange,
  title,
  caption,
  cancelLabel = "취소",
  confirmLabel = "실행",
  onConfirm,
  onCancel,
  confirmDisabled,
  confirmVariant = "primary",
  className,
  children,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  const handleClose = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleCancel = React.useCallback(() => {
    if (onCancel) onCancel();
    else handleClose();
  }, [onCancel, handleClose]);

  const handleConfirm = React.useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) handleClose();
  };

  if (!mounted || typeof document === "undefined" || !open) return null;

  const content = (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className="modal-dialog fixed inset-0 z-50 m-0 flex h-full w-full max-w-none items-center justify-center border-none bg-transparent p-4"
      aria-modal
      aria-labelledby="modal-title"
      aria-describedby={caption ? "modal-caption" : undefined}
    >
      <div
        role="presentation"
        className={cn(
          "mx-auto w-full max-w-[288px] shrink-0 rounded-(--radius) bg-white p-5 shadow-ds-soft",
          "flex flex-col gap-4",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <h1
            id="modal-title"
            className="text-left text-ds-title-20-sb leading-ds-title-18-sb font-semibold text-ds-primary"
          >
            {title}
          </h1>
          {caption != null && (
            <p
              id="modal-caption"
              className="text-left text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary"
            >
              {typeof caption === "string"
                ? caption.split("\n").map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))
                : caption}
            </p>
          )}
        </div>

        {children != null && <div className="text-foreground">{children}</div>}

        <div className="flex justify-center gap-2 pt-1">
          {cancelLabel != null && cancelLabel !== "" && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="w-[120px] shrink-0 bg-(--ds-gray-5) text-ds-tertiary hover:bg-(--ds-gray-10)"
              onClick={handleCancel}
            >
              {cancelLabel}
            </Button>
          )}
          {confirmLabel != null && confirmLabel !== "" && (
            <Button
              type="button"
              variant={confirmVariant === "destructive" ? "primary" : "primary"}
              size="md"
              className={cn(
                "w-[120px] shrink-0 text-white",
                confirmVariant === "destructive" && "bg-destructive hover:bg-destructive/90 active:bg-destructive/80"
              )}
              onClick={handleConfirm}
              disabled={confirmDisabled}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );

  return createPortal(content, document.body);
}

export { Modal };
