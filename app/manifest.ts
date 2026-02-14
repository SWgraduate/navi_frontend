import type { MetadataRoute } from "next";

/**
 * PWA Web App Manifest.
 * public/에 icon-192.png, icon-512.png 추가 시 홈화면 아이콘으로 사용됩니다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Navi",
    short_name: "Navi",
    description: "Navi Design System · 모바일 우선 PWA",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#066bf9",
    scope: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["productivity", "utilities"],
  };
}
