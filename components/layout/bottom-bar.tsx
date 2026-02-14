"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCapIcon, NaviIcon, MyIcon } from "@/components/icons/bottom-bar-icons";
import { cn } from "@/lib/utils";

const TAB_CONFIG = [
  { href: "/graduation", label: "졸업 관리", Icon: GraduationCapIcon },
  { href: "/", label: "NAVI", Icon: NaviIcon },
  { href: "/my", label: "마이", Icon: MyIcon },
] as const;

/** Figma 1136-9535: 하단 탭 바. 상단 한 줄에서 활성 구간만 파란색, 비활성=tertiary / 활성=brand */
export function BottomBar() {
  const pathname = usePathname();

  const getIsActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="flex shrink-0 flex-col bg-background"
      style={{ paddingBottom: "calc(var(--safe-area-inset-bottom) + 8px)" }}
      aria-label="하단 메뉴"
    >
      {/* 상단 한 줄: 구간별로 회색 / 파란색 */}
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
            <Link
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
