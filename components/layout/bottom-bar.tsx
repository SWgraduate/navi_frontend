"use client";

import { usePathname } from "next/navigation";
import { GraduationCapIcon, NaviIcon, MyIcon } from "@/components/icons/bottom-bar-icons";
import { TransitionLink } from "@/components/layout/transition-link";
import { cn } from "@/lib/utils";

const TAB_CONFIG = [
  { href: "/graduation", label: "졸업 관리", Icon: GraduationCapIcon },
  { href: "/home", label: "NAVI", Icon: NaviIcon },
  { href: "/my", label: "마이", Icon: MyIcon },
] as const;

/** Figma 1136-9535: 하단 탭 바. 상단 한 줄에서 활성 구간만 파란색, 비활성=tertiary / 활성=brand */
export function BottomBar() {
  const pathname = usePathname();

  const getIsActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-10 flex shrink-0 flex-col bg-white"
      style={{
        paddingBottom: "calc(var(--safe-area-inset-bottom) + 32px)",
        maxWidth: "var(--app-max-width)",
        margin: "0 auto",
      }}
      aria-label="하단 메뉴"
    >
      {/* 상단 한 줄: 구간별로 회색 / 파란색 (아이콘·글자와 동일한 ds-brand) */}
      <div className="flex h-0.5 w-full shrink-0">
        {TAB_CONFIG.map(({ href }) => (
          <div
            key={href}
            className={cn(
              "flex-1",
              getIsActive(href) ? "bg-ds-brand" : "bg-border"
            )}
          />
        ))}
      </div>
      <div className="flex flex-1 items-center justify-around">
        {TAB_CONFIG.map(({ href, label, Icon }) => {
          const isActive = getIsActive(href);
          return (
            <TransitionLink
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2",
                isActive ? "text-ds-brand" : "text-ds-tertiary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="mt-1" />
              <span className="text-ds-caption-14-m leading-ds-caption-14-m font-medium">
                {label}
              </span>
            </TransitionLink>
          );
        })}
      </div>
    </nav>
  );
}
