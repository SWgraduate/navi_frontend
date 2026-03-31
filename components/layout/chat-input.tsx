"use client";

import * as React from "react";
import Image from "next/image";
import { VoiceModeButton } from "@/components/ui/icon-buttons";
import { AttachmentMenu } from "@/components/ui/attachment-menu";
import { AttachmentFileCard, AttachmentImageCard } from "@/components/ui/attachment-card";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/chat-context";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export interface ChatInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string;
  onAttachClick?: () => void;
  /** 파일 선택 완료 (파일 피커) */
  onFileSelect?: (files: File[]) => void;
  /** 사진 선택 완료 (앨범) */
  onPhotoSelect?: (files: File[]) => void;
  /** 카메라 촬영 완료 */
  onCameraCapture?: (files: File[]) => void;
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
  onFileSelect,
  onPhotoSelect,
  onCameraCapture,
  onSpeakClick,
  onHeightChange,
  isKeyboardOpen = false,
  keyboardHeight = 0,
  bottomBarHeight = 0,
  ...inputProps
}: ChatInputProps) {
  const { sendMessage } = useChat();
  const { t } = useTranslation();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const clipButtonRef = React.useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [attachMenuOpen, setAttachMenuOpen] = React.useState(false);
  const [attachments, setAttachments] = React.useState<
    { id: string; file: File; previewUrl?: string }[]
  >([]);

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
    sendMessage(inputValue, attachments.map((a) => a.file));
    setInputValue("");
    setAttachments([]);
    // 키보드를 닫지 않고 포커스 유지
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addAttachments = React.useCallback((files: File[]) => {
    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const previewUrl =
          file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        return { id, file, previewUrl };
      }),
    ]);
  }, []);

  const removeAttachment = React.useCallback((id: string) => {
    setAttachments((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const handleFileSelect = React.useCallback(
    (files: File[]) => {
      if (onFileSelect) {
        onFileSelect(files);
      } else {
        addAttachments(files);
      }
    },
    [onFileSelect, addAttachments]
  );

  const handlePhotoSelect = React.useCallback(
    (files: File[]) => {
      if (onPhotoSelect) {
        onPhotoSelect(files);
      } else {
        addAttachments(files);
      }
    },
    [onPhotoSelect, addAttachments]
  );

  const handleCameraCapture = React.useCallback(
    (files: File[]) => {
      if (onCameraCapture) {
        onCameraCapture(files);
      } else {
        addAttachments(files);
      }
    },
    [onCameraCapture, addAttachments]
  );

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
        {attachments.length > 0 && (
          <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
            {attachments.map(({ id, file, previewUrl }) =>
              previewUrl ? (
                <AttachmentImageCard
                  key={id}
                  previewUrl={previewUrl}
                  onRemove={() => removeAttachment(id)}
                />
              ) : (
                <AttachmentFileCard
                  key={id}
                  file={file}
                  onRemove={() => removeAttachment(id)}
                />
              )
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder={t("chatInput.placeholder")}
          className="w-full bg-transparent pb-4 text-base text-foreground placeholder:text-ds-tertiary focus:outline-none"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          {...inputProps}
        />
        <div className="flex items-center justify-between">
          <button
            ref={clipButtonRef}
            type="button"
            onClick={() => setAttachMenuOpen((o) => !o)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ds-tertiary hover:bg-(--ds-gray-10)"
            aria-label="첨부"
            aria-expanded={attachMenuOpen}
            aria-haspopup="menu"
          >
            <Image src="/icons/clip.svg" alt="" width={24} height={24} />
          </button>
          <AttachmentMenu
            anchorRef={clipButtonRef}
            open={attachMenuOpen}
            onClose={() => setAttachMenuOpen(false)}
            onFileSelect={handleFileSelect}
            onPhotoSelect={handlePhotoSelect}
            onCameraCapture={handleCameraCapture}
          />
          <VoiceModeButton onClick={onSpeakClick} className="shrink-0" />
        </div>
      </div>
    </div>
  );
}

export { ChatInput };
