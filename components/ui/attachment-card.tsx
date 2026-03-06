"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function getFileTypeLabel(file: File, fallback: string): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const typeMap: Record<string, string> = {
    pdf: "PDF",
    doc: "DOC",
    docx: "DOCX",
    xls: "XLS",
    xlsx: "XLSX",
    ppt: "PPT",
    pptx: "PPTX",
    jpg: "JPG",
    jpeg: "JPEG",
    png: "PNG",
    gif: "GIF",
    webp: "WEBP",
  };
  return (typeMap[ext] ?? ext.toUpperCase()) || fallback;
}

/** Figma 1650-15560: 파일 첨부 카드 - 파일명(shrink) + 파일형식 + X버튼(우상단) */
export function AttachmentFileCard({
  file,
  onRemove,
  loading,
  progress = 0,
  className,
}: {
  file: File;
  onRemove: () => void;
  loading?: boolean;
  progress?: number;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "relative flex h-14 max-w-36 shrink-0 items-center overflow-hidden rounded border px-2",
        "border-[#EEEFF1] bg-white",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-ds-caption-14-m leading-ds-caption-14-m text-ds-secondary tracking-[-0.35px]"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="shrink-0 text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary tracking-[-0.35px]">
          {getFileTypeLabel(file, t("common.file"))}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-0.5 top-0.5 flex size-6 shrink-0 items-center justify-center rounded text-ds-tertiary hover:bg-(--ds-gray-5) active:opacity-80"
        aria-label={t("common.remove")}
      >
        <X className="size-4" strokeWidth={1.5} />
      </button>
      {loading && (
        <AttachmentCardLoading progress={progress} />
      )}
    </div>
  );
}

/** Figma 1650-15570: 이미지 첨부 카드 - 미리보기 + X버튼(우상단) */
export function AttachmentImageCard({
  previewUrl,
  onRemove,
  loading,
  progress = 0,
  className,
}: {
  previewUrl: string;
  onRemove: () => void;
  loading?: boolean;
  progress?: number;
  className?: string;
}) {
  const { t } = useTranslation();
  React.useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div
      className={cn(
        "relative size-14 shrink-0 overflow-hidden rounded border border-[#EEEFF1]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt=""
        className="size-full border-0 object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-0.5 top-0.5 flex size-6 shrink-0 items-center justify-center rounded bg-white/90 text-ds-tertiary hover:bg-white active:opacity-80"
        aria-label={t("common.remove")}
      >
        <X className="size-4" strokeWidth={1.5} />
      </button>
      {loading && (
        <AttachmentCardLoading progress={progress} />
      )}
    </div>
  );
}

/** 업로드 로딩: 어두운 배경 + 원형 진행률(brand색 차오름), 링은 gray-10 */
function AttachmentCardLoading({ progress }: { progress: number }) {
  const size = 56;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded bg-black/30">
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* 배경 링 - gray-10 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ds-gray-10)"
          strokeWidth={stroke}
        />
        {/* 진행률 - brand색 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ds-color-brand)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-150"
        />
      </svg>
    </div>
  );
}
