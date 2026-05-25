"use client";

import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
  /** 메뉴 쿼리 응답일 때 답변 아래에 가로 스크롤 썸네일로 표시 */
  menuImages?: string[];
}

export function ChatMessage({ message, isUser, menuImages }: ChatMessageProps) {
  const { t } = useTranslation();

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] rounded-sm bg-[#ffffff] px-4 py-3">
          <p className="text-ds-gray-90 text-regular leading-relaxed break-words">
            {message}
          </p>
        </div>
      </div>
    );
  }

  const hasMenuImages = Array.isArray(menuImages) && menuImages.length > 0;

  return (
    <div className="flex flex-col items-start gap-3 mb-4 w-full">
      <div className="prose prose-sm max-w-none text-ds-gray-90 break-words [&_a]:text-blue-600 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5 [&_p]:my-1">
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>

      {hasMenuImages && (
        <ul
          className="-mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={t("chat.menuImagesLabel")}
        >
          {menuImages!.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="shrink-0 overflow-hidden rounded-md border border-ds-gray-10 bg-ds-gray-5"
              style={{ width: 140, height: 140 }}
            >
              {/* 외부 한양대 도메인 → next/image 도메인 등록 회피 위해 일반 <img> 사용 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={t("chat.menuImageAlt", { index: i + 1 })}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
