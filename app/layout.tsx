import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LayoutContent } from "@/components/layout/layout-content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Navi",
  description: "Navi Design System · 모바일 우선 PWA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Navi",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden font-sans antialiased`}
      >
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
