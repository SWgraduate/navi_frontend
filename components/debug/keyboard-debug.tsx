"use client";

import { useEffect, useState } from "react";

function KeyboardDebugPanel() {
  const [headerVisibleTop, setHeaderVisibleTop] = useState<number | null>(null);
  const [chatInputBottom, setChatInputBottom] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateHeaderVisibleTop = () => {
      const headerEl = document.querySelector("header") as HTMLElement | null;
      if (headerEl) {
        if (window.visualViewport) {
          const headerHeight = headerEl.offsetHeight;
          const visualViewportOffsetTop = window.visualViewport.offsetTop || 0;
          setHeaderVisibleTop(headerHeight + visualViewportOffsetTop);
        } else {
          setHeaderVisibleTop(headerEl.getBoundingClientRect().bottom);
        }
      } else {
        setHeaderVisibleTop(null);
      }

      const chatInputEl = document.querySelector("[data-chat-input]") as HTMLElement | null;
      if (chatInputEl) {
        const rect = chatInputEl.getBoundingClientRect();
        setChatInputBottom(window.innerHeight - rect.bottom);
      }
    };

    updateHeaderVisibleTop();
    window.visualViewport?.addEventListener("resize", updateHeaderVisibleTop);
    window.visualViewport?.addEventListener("scroll", updateHeaderVisibleTop);
    window.addEventListener("scroll", updateHeaderVisibleTop, true);

    const interval = window.setInterval(updateHeaderVisibleTop, 200);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeaderVisibleTop);
      window.visualViewport?.removeEventListener("scroll", updateHeaderVisibleTop);
      window.removeEventListener("scroll", updateHeaderVisibleTop, true);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: chatInputBottom > 0 ? `${chatInputBottom + 200}px` : "200px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "14px",
        fontFamily: "monospace",
        zIndex: 9999,
        minWidth: "200px",
        lineHeight: "1.6",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px", borderBottom: "1px solid #555", paddingBottom: "4px" }}>
        헤더 아래 Top
      </div>
      {headerVisibleTop !== null ? (
        <>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: headerVisibleTop > 0 ? "#4ade80" : "#f87171" }}>
            {headerVisibleTop.toFixed(0)}px
          </div>
          {(() => {
            const headerEl = document.querySelector("header") as HTMLElement | null;
            if (headerEl && window.visualViewport) {
              const headerHeight = headerEl.offsetHeight;
              const offsetTop = window.visualViewport.offsetTop || 0;
              return (
                <div style={{ fontSize: "10px", color: "#aaa", marginTop: "4px", lineHeight: "1.4" }}>
                  <div>헤더 높이: {headerHeight.toFixed(0)}px</div>
                  <div>Viewport offsetTop: {offsetTop.toFixed(0)}px</div>
                </div>
              );
            }
            return null;
          })()}
        </>
      ) : (
        <div style={{ fontSize: "14px", color: "#f87171" }}>헤더 없음</div>
      )}
    </div>
  );
}

export function KeyboardDebug() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <KeyboardDebugPanel />;
}
