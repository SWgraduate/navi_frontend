"use client";

export interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export function ChatMessage({ message, isUser }: ChatMessageProps) {
  if (isUser) {
    // 사용자 메시지: 파란색 버블 (오른쪽 정렬)
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

  // 어시스턴트 답변: 흰바탕 없이 그냥 글자만 (왼쪽 정렬)
  return (
    <div className="flex justify-start mb-4">
      <p className="text-ds-gray-90 text-regular leading-relaxed break-words">
        {message}
      </p>
    </div>
  );
}
