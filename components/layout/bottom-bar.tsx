"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TAB_CONFIG = [
  {
    href: "/graduation",
    label: "졸업 관리",
    iconSrc: "/icons/graduation-cap-Default.svg",
  },
  {
    href: "/",
    label: "NAVI",
    iconSrc: "/icons/Navi-icon%203.svg",
  },
  {
    href: "/my",
    label: "마이",
    iconSrc: "/icons/my.svg",
  },
] as const;

/** Figma 1136-9535: 하단 탭 바. 졸업 관리 | NAVI(활성) | 마이 */
export function BottomBar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex h-14 shrink-0 items-center justify-around border-t border-border bg-background"
      style={{ paddingBottom: "calc(var(--safe-area-inset-bottom) + 8px)" }}
      aria-label="하단 메뉴"
    >
      {TAB_CONFIG.map(({ href, label, iconSrc }) => {
        const isActive =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2",
              isActive
                ? "border-t-2 border-primary text-primary"
                : "text-[var(--ds-icon-default)]"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Image
              src={iconSrc}
              alt=""
              width={24}
              height={24}
              className={cn("shrink-0", !isActive && "opacity-70")}
            />
            <span className="text-[10px] font-medium leading-none">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
