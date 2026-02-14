"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";

/** 경로가 /splash면 헤더·프레임 없이, 아니면 앱 프레임 + 헤더 */
export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSplash = pathname === "/splash";

  if (isSplash) {
    return <>{children}</>;
  }

  return (
    <div className="app-frame">
      <AppHeader title="로그인" />
      {children}
    </div>
  );
}
