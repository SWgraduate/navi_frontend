"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type DocumentWithViewTransition = Document & {
  startViewTransition?(callback: () => void | Promise<void>): { finished: Promise<void> };
};

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/**
 * Next.js Link + View Transitions API.
 * 클릭 시 크로스페이드로 페이지 전환 (PWA 모바일에서 끊김 감소).
 */
export function TransitionLink({ href, onClick, children, ...props }: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const targetHref = target.getAttribute("href");
    if (!targetHref || targetHref.startsWith("http") || targetHref.startsWith("mailto:")) {
      onClick?.(e);
      return;
    }
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      onClick?.(e);
      return;
    }
    e.preventDefault();
    onClick?.(e);

    const navigate = () => router.push(targetHref);

    const doc = typeof document !== "undefined" ? (document as DocumentWithViewTransition) : null;
    if (doc?.startViewTransition) {
      doc.startViewTransition(navigate);
    } else {
      navigate();
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
