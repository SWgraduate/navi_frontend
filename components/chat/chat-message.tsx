"use client";

import ReactMarkdown from "react-markdown";

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export function ChatMessage({ message, isUser }: ChatMessageProps) {
  if (isUser) {
    // 사용자 메시지: 버블 (오른쪽 정렬)
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

  // 어시스턴트 답변: 마크다운 렌더링 (왼쪽 정렬)
  return (
    <div className="flex justify-start mb-4">
      <div className="prose prose-sm max-w-none text-ds-gray-90 break-words [&_a]:text-blue-600 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5 [&_p]:my-1">
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>
    </div>
  );
}
