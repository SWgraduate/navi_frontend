/**
 * 모바일 우선 breakpoint (Tailwind와 동일).
 * useMediaQuery 등에서 사용: window.matchMedia(`(min-width: ${breakpoints.md})`)
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export type BreakpointKey = keyof typeof breakpoints;

/** Tailwind sm: ~ 2xl: 미디어 쿼리 문자열 */
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  "2xl": `(min-width: ${breakpoints["2xl"]})`,
} as const;
