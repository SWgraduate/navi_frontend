"use client";

/**
 * 어시스턴트 답변 대기 로딩: primary 색상 24x24 파란 원이 커졌다 작아지는 애니메이션
 */
export function ChatLoading() {
  return (
    <div className="flex justify-start mb-4 items-center">
      <div
        className="rounded-full bg-primary animate-pulse-scale"
        style={{ width: 24, height: 24 }}
        aria-label="답변 생성 중"
      />
    </div>
  );
}
