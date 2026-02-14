"use client";

import { Camera, AudioLines, ChevronUp } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 24×24 (디자인 시스템) */
const iconSize = "size-6";

/** Btn/VoiceMode - 파란 버튼 + 음파 아이콘(24×24) + "말하기", 흰색 텍스트/아이콘, 라운딩 축소 */
function VoiceModeButton({
  className,
  children = "말하기",
  ...props
}: Omit<ButtonProps, "variant" | "leftIcon"> & { children?: React.ReactNode }) {
  return (
    <Button
      variant="primary"
      size="md"
      leftIcon={<AudioLines className="size-6" />}
      className={cn(
        "rounded-sm text-white [&_svg]:size-6! [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

/** Input/btn/camera - 회색 사각형 + 카메라 아이콘(24×24) */
function CameraIconButton({
  className,
  ...props
}: Omit<ButtonProps, "variant" | "size" | "children">) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("[&_svg]:size-6!", className)}
      {...props}
    >
      <Camera className={iconSize} />
    </Button>
  );
}

/** Btn - 위쪽 화살표 (회색 기본 / 파란 활성), 아이콘 24×24 */
function ArrowUpIconButton({
  className,
  variant = "outline",
  ...props
}: Omit<ButtonProps, "size" | "children"> & {
  variant?: "outline" | "primary";
}) {
  return (
    <Button
      variant={variant}
      size="icon"
      className={cn("[&_svg]:size-6!", className)}
      aria-label="위로"
      {...props}
    >
      <ChevronUp className={iconSize} />
    </Button>
  );
}

export { VoiceModeButton, CameraIconButton, ArrowUpIconButton };
