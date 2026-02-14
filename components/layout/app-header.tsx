"use client";

import { useRouter } from "next/navigation";
import { Header } from "./header";

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
  onHistory,
  onAdd,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <Header
      showBack={showBack}
      onBack={showBack ? () => router.back() : undefined}
      showTitle={showTitle}
      title={title}
      showHistory={showHistory}
      onHistory={showHistory ? onHistory ?? (() => {}) : undefined}
      showAdd={showAdd}
      onAdd={showAdd ? onAdd ?? (() => {}) : undefined}
    />
  );
}

export { AppHeader };
