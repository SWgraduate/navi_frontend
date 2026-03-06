"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface AttachmentMenuProps {
  /** 트리거 버튼의 ref (메뉴 위치 계산용) */
  anchorRef: React.RefObject<HTMLElement | null>;
  /** 열림 상태 */
  open: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 파일 선택 완료 (선택된 파일들) */
  onFileSelect?: (files: File[]) => void;
  /** 사진(앨범) 선택 완료 */
  onPhotoSelect?: (files: File[]) => void;
  /** 카메라 촬영 완료 */
  onCameraCapture?: (files: File[]) => void;
  className?: string;
}

const ITEM_CLASS =
  "flex w-full items-center gap-2 px-4 py-2 text-left text-ds-caption-14-r leading-ds-caption-14-r text-ds-primary hover:bg-(--ds-gray-5) active:bg-(--ds-gray-10) first:rounded-t-lg last:rounded-b-lg transition-colors";

/**
 * Figma 1162-10142: 첨부 메뉴 (파일 / 사진 / 카메라)
 * Clip 버튼 클릭 시 나타나는 팝업
 */
export function AttachmentMenu({
  anchorRef,
  open,
  onClose,
  onFileSelect,
  onPhotoSelect,
  onCameraCapture,
  className,
}: AttachmentMenuProps) {
  const { t } = useTranslation();
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      onFileSelect?.(files);
      e.target.value = "";
      onClose();
    },
    [onFileSelect, onClose]
  );

  const handlePhotoInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      onPhotoSelect?.(files);
      e.target.value = "";
      onClose();
    },
    [onPhotoSelect, onClose]
  );

  const handleCameraInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      onCameraCapture?.(files);
      e.target.value = "";
      onClose();
    },
    [onCameraCapture, onClose]
  );

  const triggerFile = React.useCallback(() => {
    onClose();
    requestAnimationFrame(() => fileInputRef.current?.click());
  }, [onClose]);

  const triggerPhoto = React.useCallback(() => {
    onClose();
    requestAnimationFrame(() => photoInputRef.current?.click());
  }, [onClose]);

  const triggerCamera = React.useCallback(() => {
    onClose();
    requestAnimationFrame(() => cameraInputRef.current?.click());
  }, [onClose]);

  React.useEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const menuHeight = 120;
      const menuWidth = 120;
      const gap = 24;

      let top = rect.top - menuHeight - gap;
      let left = rect.left;

      // 화면 밖으로 나가지 않도록
      if (top < 8) top = 8;
      if (left + menuWidth > window.innerWidth - 16) left = window.innerWidth - menuWidth - 16;
      if (left < 16) left = 16;

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, anchorRef]);

  const content = !open || typeof document === "undefined" ? null : (
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
        aria-label={t("attachmentMenu.label")}
        className={cn(
          "fixed z-50 flex flex-col rounded-lg border border-(--ds-gray-10) bg-white py-1 shadow-ds-soft",
          className
        )}
        style={{
          top: position.top,
          left: position.left,
          minWidth: 120,
        }}
      >
        <button
          type="button"
          role="menuitem"
          className={ITEM_CLASS}
          onClick={triggerFile}
        >
          <Image
            src="/icons/file.svg"
            alt=""
            width={24}
            height={24}
            className="shrink-0 opacity-70"
          />
          {t("attachmentMenu.file")}
        </button>
        <button
          type="button"
          role="menuitem"
          className={ITEM_CLASS}
          onClick={triggerPhoto}
        >
          <Image
            src="/icons/image.svg"
            alt=""
            width={24}
            height={24}
            className="shrink-0 opacity-70"
          />
          {t("attachmentMenu.photo")}
        </button>
        <button
          type="button"
          role="menuitem"
          className={ITEM_CLASS}
          onClick={triggerCamera}
        >
          <Image
            src="/icons/camera.svg"
            alt=""
            width={24}
            height={24}
            className="shrink-0 opacity-70"
          />
          {t("attachmentMenu.camera")}
        </button>
      </div>
    </>
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        multiple
        className="sr-only"
        aria-hidden
        onChange={handleFileInputChange}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-hidden
        onChange={handlePhotoInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-hidden
        onChange={handleCameraInputChange}
      />
      {content != null && createPortal(content, document.body)}
    </>
  );
}
