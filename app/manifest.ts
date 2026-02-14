import type { MetadataRoute } from "next";

const LOGO_SRC = "/icons/Navi-icon%203.svg";

/**
 * PWA Web App Manifest. 로고(SVG)를 홈화면 아이콘으로 사용.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Navi",
    short_name: "Navi",
    description: "Navi Design System · 모바일 우선 PWA",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f4f6",
    theme_color: "#066bf9",
    scope: "/",
    icons: [
      { src: LOGO_SRC, sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: LOGO_SRC, sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
    categories: ["productivity", "utilities"],
  };
}
