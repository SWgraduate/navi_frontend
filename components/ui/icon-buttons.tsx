"use client";

import { Camera, AudioLines, ChevronUp } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconSize = "size-5";

/** Btn/VoiceMode - 파란 버튼 + 음파 아이콘 + "말하기" */
function VoiceModeButton({
  className,
  children = "말하기",
  ...props
}: Omit<ButtonProps, "variant" | "leftIcon"> & { children?: React.ReactNode }) {
  return (
    <Button
      variant="primary"
      size="md"
      leftIcon={<AudioLines className={iconSize} />}
      className={cn(className)}
      {...props}
    >
      {children}
    </Button>
  );
}

/** Input/btn/camera - 회색 사각형 + 카메라 아이콘 */
function CameraIconButton({
  className,
  ...props
}: Omit<ButtonProps, "variant" | "size" | "children">) {
  return (
    <Button variant="ghost" size="icon" className={cn(className)} {...props}>
      <Camera className={iconSize} />
    </Button>
  );
}

/** Btn - 위쪽 화살표 (회색 기본 / 파란 활성) */
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
      className={cn(className)}
      aria-label="위로"
      {...props}
    >
      <ChevronUp className={iconSize} />
    </Button>
  );
}

export { VoiceModeButton, CameraIconButton, ArrowUpIconButton };
