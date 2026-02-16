"use client";

import { useRouter } from "next/navigation";
import { Header } from "./header";
import { withViewTransition } from "@/lib/view-transition";

export interface AppHeaderProps {
  /** [중] 타이틀 텍스트 */
  title?: string;
  /** [좌] 뒤로가기 노출 */
  showBack?: boolean;
  /** [중] 타이틀 영역 노출 */
  showTitle?: boolean;
  /** [우] 히스토리 버튼 노출 */
  showHistory?: boolean;
  /** [우] 추가 버튼 노출 */
  showAdd?: boolean;
  /** 스크롤 시 헤더 하단 쉐도우 (디자인 시스템) */
  scrolled?: boolean;
  /** 헤더 루트에 적용할 클래스 (예: 배경색) */
  className?: string;
  onHistory?: () => void;
  onAdd?: () => void;
}

/** 레이아웃용 헤더 – 좌/중/우 각각 on/off, 뒤로가기는 router.back() */
function AppHeader({
  title = "",
  showBack = true,
  showTitle = true,
  showHistory = true,
  showAdd = true,
  scrolled,
  className,
  onHistory,
  onAdd,
}: AppHeaderProps) {
  const router = useRouter();
  const handleBack = () => withViewTransition(() => router.back());

  return (
    <Header
      showBack={showBack}
      onBack={showBack ? handleBack : undefined}
      showTitle={showTitle}
      title={title}
      showHistory={showHistory}
      onHistory={showHistory ? onHistory ?? (() => {}) : undefined}
      showAdd={showAdd}
      onAdd={showAdd ? onAdd ?? (() => {}) : undefined}
      scrolled={scrolled}
      className={className}
    />
  );
}

export { AppHeader };
