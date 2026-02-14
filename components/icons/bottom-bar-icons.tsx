"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const size = 24;
const strokeWidth = 1.5;
const stroke = "currentColor";

/** 졸업모자 아이콘 (stroke) – currentColor 상속 */
export function GraduationCapIcon({ className }: { className?: string }) {
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
        d="M22.3445 10.8153C22.5413 10.7285 22.7082 10.5859 22.8247 10.4051C22.9412 10.2243 23.0022 10.0133 22.9999 9.79829C22.9977 9.58324 22.9325 9.37356 22.8122 9.19523C22.692 9.01691 22.5221 8.87776 22.3236 8.79504L12.9027 4.50391C12.6163 4.37327 12.3051 4.30566 11.9904 4.30566C11.6756 4.30566 11.3644 4.37327 11.078 4.50391L1.6582 8.79065C1.46252 8.87635 1.29605 9.01723 1.17915 9.19604C1.06225 9.37485 1 9.58385 1 9.79748C1 10.0111 1.06225 10.2201 1.17915 10.3989C1.29605 10.5777 1.46252 10.7186 1.6582 10.8043L11.078 15.0999C11.3644 15.2305 11.6756 15.2981 11.9904 15.2981C12.3051 15.2981 12.6163 15.2305 12.9027 15.0999L22.3445 10.8153Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 11V17"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.39258 12.5497V16.3968C5.39258 17.2714 6.08741 18.1101 7.32421 18.7285C8.56101 19.3469 10.2385 19.6943 11.9876 19.6943C13.7367 19.6943 15.4141 19.3469 16.6509 18.7285C17.8877 18.1101 18.5826 17.2714 18.5826 16.3968V12.5497"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** NAVI 로고 아이콘 (fill) – currentColor 상속 */
export function NaviIcon({ className }: { className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M58.7421 56.2469C58.7421 57.8952 56.7619 58.7346 55.5773 57.5882L55.3515 57.3696L33.2616 35.993C32.5379 35.2928 31.3891 35.2928 30.6653 35.9933L8.57814 57.3696L8.3523 57.5882C7.16782 58.7346 5.1875 57.8952 5.1875 56.2469V7.6618C5.1875 6.0135 7.16782 5.17414 8.3523 6.32041L8.57814 6.53897L30.6656 27.913C31.3891 28.6133 32.5379 28.6133 33.2616 27.913L55.3515 6.53897L55.5773 6.32041C56.7619 5.17414 58.7421 6.0135 58.7421 7.6618V56.2469ZM9.1875 46.8093C9.1875 48.4576 11.1678 49.297 12.3523 48.1509L23.7058 37.1637C24.9115 35.9968 24.0855 33.9557 22.4077 33.9557H11.0542C10.0232 33.9557 9.1875 34.7914 9.1875 35.8224V46.8093ZM51.5773 48.1509C52.7619 49.297 54.7421 48.4576 54.7421 46.8093V35.8224C54.7421 34.7914 53.9064 33.9557 52.8755 33.9557H41.5221C39.8443 33.9557 39.0181 35.9968 40.224 37.1637L51.5773 48.1509ZM9.1875 28.089C9.1875 29.12 10.0232 29.9557 11.0542 29.9557H22.4108C24.0885 29.9557 24.9146 27.9144 23.709 26.7477L12.3524 15.7558C11.168 14.6094 9.1875 15.4488 9.1875 17.0971V28.089ZM40.2208 26.7477C39.0152 27.9144 39.8411 29.9557 41.5189 29.9557H52.8755C53.9064 29.9557 54.7421 29.12 54.7421 28.089V17.0971C54.7421 15.4488 52.7619 14.6094 51.5773 15.7558L40.2208 26.7477Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** 마이(사람) 아이콘 (stroke) – currentColor 상속 */
export function MyIcon({ className }: { className?: string }) {
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
        d="M12 13C14.7614 13 17 10.7614 17 8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8C7 10.7614 9.23858 13 12 13Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 21C20 18.8783 19.1571 16.8434 17.6569 15.3431C16.1566 13.8429 14.1217 13 12 13C9.87827 13 7.84344 13.8429 6.34315 15.3431C4.84285 16.8434 4 18.8783 4 21"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
