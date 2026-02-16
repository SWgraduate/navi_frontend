/**
 * View Transitions API를 사용한 라우팅 유틸리티
 */

type DocumentWithViewTransition = Document & {
  startViewTransition?(callback: () => void | Promise<void>): { finished: Promise<void> };
};

/**
 * View Transitions API로 라우팅 함수를 실행하여 페이지 전환 시 크로스페이드 효과 적용
 */
export function withViewTransition(navigate: () => void | Promise<void>): void {
  const doc = typeof document !== "undefined" ? (document as DocumentWithViewTransition) : null;
  
  if (doc?.startViewTransition) {
    doc.startViewTransition(navigate);
  } else {
    navigate();
  }
}
