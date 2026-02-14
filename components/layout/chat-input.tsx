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
}

/** Figma 1136-9535: 하단 바 바로 위. 바=BG/Surface, 입력창=흰색(BG/Default) 한 덩어리, 높이 타이트 */
function ChatInput({
  className,
  onAttachClick,
  onSpeakClick,
  ...inputProps
}: ChatInputProps) {
  return (
    <div
      className={cn(
        "shrink-0 bg-(--ds-bg-default) p-4",
        className
      )}
    >
      <div className="flex flex-col rounded-xl bg-(--ds-bg-surface) p-4">
        <input
          type="text"
          placeholder="무엇이든 물어보세요."
          className="w-full bg-transparent pb-4 text-base text-foreground placeholder:text-(--ds-text-subtle) focus:outline-none"
          {...inputProps}
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onAttachClick}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-(--ds-icon-default) hover:bg-(--ds-gray-10)"
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
