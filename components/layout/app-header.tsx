"use client";

import { useRouter } from "next/navigation";
import { Header } from "./header";

export interface AppHeaderProps {
  title: string;
  /** 오른쪽 히스토리 버튼 노출 여부 */
  showHistory?: boolean;
  /** 오른쪽 추가 버튼 노출 여부 */
  showAdd?: boolean;
  onHistory?: () => void;
  onAdd?: () => void;
}

/** 레이아웃용 헤더 – 뒤로가기는 router.back() 사용 */
function AppHeader({
  title,
  showHistory = true,
  showAdd = true,
  onHistory,
  onAdd,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <Header
      title={title}
      onBack={() => router.back()}
      onHistory={showHistory ? onHistory ?? (() => {}) : undefined}
      onAdd={showAdd ? onAdd ?? (() => {}) : undefined}
    />
  );
}

export { AppHeader };
