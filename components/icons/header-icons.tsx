"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Figma 디자인 시스템: color/text/bolder (#131416) 상속. 24×24 */
const size = 24;
const strokeWidth = 1.5;
const stroke = "currentColor";

function LeftIcon({ className }: { className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M12 19L5 12L12 5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 12H5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M3 12C3 13.78 3.52784 15.5201 4.51677 17.0001C5.50571 18.4802 6.91131 19.6337 8.55585 20.3149C10.2004 20.9961 12.01 21.1743 13.7558 20.8271C15.5016 20.4798 17.1053 19.6226 18.364 18.364C19.6226 17.1053 20.4798 15.5016 20.8271 13.7558C21.1743 12.01 20.9961 10.2004 20.3149 8.55585C19.6337 6.91131 18.4802 5.50571 17.0001 4.51677C15.5201 3.52784 13.78 3 12 3C9.48395 3.00947 7.06897 3.99122 5.26 5.74L3 8"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 3V8H8"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 7V12L16 14"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NewChatIcon({ className }: { className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M21 16.529C21 17.0037 20.8104 17.459 20.4728 17.7946C20.1352 18.1303 19.6774 18.3189 19.2 18.3189H7.3452C6.86785 18.319 6.41009 18.5076 6.0726 18.8433L4.0908 20.8139C4.00143 20.9028 3.88758 20.9633 3.76364 20.9878C3.6397 21.0123 3.51123 20.9997 3.39448 20.9516C3.27772 20.9036 3.17793 20.8221 3.10772 20.7176C3.0375 20.6132 3.00002 20.4903 3 20.3647V5.78986C3 5.31516 3.18964 4.8599 3.52721 4.52424C3.86477 4.18857 4.32261 4 4.8 4H19.2C19.6774 4 20.1352 4.18857 20.4728 4.52424C20.8104 4.8599 21 5.31516 21 5.78986V16.529Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8V14"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 11H15"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RightIcon({ className }: { className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M5 12H19"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 5L19 12L12 19"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M12 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V12"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3751 2.62501C18.7729 2.22719 19.3125 2.00369 19.8751 2.00369C20.4377 2.00369 20.9773 2.22719 21.3751 2.62501C21.7729 3.02284 21.9964 3.5624 21.9964 4.12501C21.9964 4.68762 21.7729 5.22719 21.3751 5.62501L12.3621 14.639C12.1246 14.8763 11.8313 15.0499 11.5091 15.144L8.63609 15.984C8.55005 16.0091 8.45883 16.0106 8.372 15.9884C8.28517 15.9661 8.20592 15.9209 8.14254 15.8576C8.07916 15.7942 8.03398 15.7149 8.01174 15.6281C7.98949 15.5413 7.991 15.4501 8.01609 15.364L8.85609 12.491C8.95062 12.1691 9.12463 11.8761 9.36209 11.639L18.3751 2.62501Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M3 7V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H7"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V7"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 17V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H17"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V17"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 12H17"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { LeftIcon, HistoryIcon, NewChatIcon, RightIcon, EditIcon, ScanIcon };
