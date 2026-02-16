"use client";

import { useEffect, useRef, useState } from "react";

type VirtualKeyboardLike = {
  boundingRect?: { height?: number };
  addEventListener?: (type: "geometrychange", listener: EventListener) => void;
  removeEventListener?: (type: "geometrychange", listener: EventListener) => void;
};

type NavigatorWithVirtualKeyboard = Navigator & {
  virtualKeyboard?: VirtualKeyboardLike;
};

export function useKeyboardStatus() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const rafRef = useRef<number | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);
  const inputFocusedRef = useRef(false);
  const focusBaselineVisibleBottomRef = useRef<number | null>(null);

  const isEditableElement = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") return true;
    return target.isContentEditable || target.getAttribute("contenteditable") === "true";
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const KEYBOARD_THRESHOLD = 60;

    const getVisibleBottom = () => {
      const visualViewport = window.visualViewport;
      if (!visualViewport) return window.innerHeight;
      return visualViewport.height + Math.max(0, visualViewport.offsetTop);
    };

    const getKeyboardHeightFromVisualViewport = () => {
      const visibleBottom = getVisibleBottom();
      const focusBaselineVisibleBottom = focusBaselineVisibleBottomRef.current;
      if (inputFocusedRef.current && focusBaselineVisibleBottom != null) {
        return Math.max(0, Math.round(focusBaselineVisibleBottom - visibleBottom));
      }
      return Math.max(0, Math.round(window.innerHeight - visibleBottom));
    };

    const getKeyboardHeightFromVirtualKeyboard = () => {
      const virtualKeyboard = (navigator as NavigatorWithVirtualKeyboard).virtualKeyboard;
      return Math.max(0, Math.round(virtualKeyboard?.boundingRect?.height ?? 0));
    };

    const update = () => {
      const fromVisualViewport = getKeyboardHeightFromVisualViewport();
      const fromVirtualKeyboard = getKeyboardHeightFromVirtualKeyboard();
      const nextHeight = Math.max(fromVisualViewport, fromVirtualKeyboard);
      const nextOpen = nextHeight > KEYBOARD_THRESHOLD;

      // 포커스 직후 지연 구간에서 false로 떨어지는 깜빡임 방지.
      const resolvedOpen = inputFocusedRef.current ? nextOpen || nextHeight > 0 : nextOpen;

      setIsKeyboardOpen((prev) => (prev === resolvedOpen ? prev : resolvedOpen));
      setKeyboardHeight((prev) => {
        const resolvedHeight = resolvedOpen ? nextHeight : 0;
        return prev === resolvedHeight ? prev : resolvedHeight;
      });
    };

    const scheduleUpdate = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        update();
        rafRef.current = null;
      });
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!isEditableElement(event.target)) return;
      inputFocusedRef.current = true;
      focusBaselineVisibleBottomRef.current = getVisibleBottom();
      scheduleUpdate();
      timeoutIdsRef.current.push(window.setTimeout(scheduleUpdate, 60));
      timeoutIdsRef.current.push(window.setTimeout(scheduleUpdate, 160));
      timeoutIdsRef.current.push(window.setTimeout(scheduleUpdate, 300));
    };

    const handleFocusOut = () => {
      window.setTimeout(() => {
        inputFocusedRef.current = isEditableElement(document.activeElement);
        if (!inputFocusedRef.current) {
          focusBaselineVisibleBottomRef.current = null;
        }
        scheduleUpdate();
        timeoutIdsRef.current.push(window.setTimeout(scheduleUpdate, 120));
      }, 0);
    };

    const virtualKeyboard = (navigator as NavigatorWithVirtualKeyboard).virtualKeyboard;

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    window.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("scroll", scheduleUpdate);
    virtualKeyboard?.addEventListener?.("geometrychange", scheduleUpdate);

    scheduleUpdate();

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutIdsRef.current = [];
      focusBaselineVisibleBottomRef.current = null;
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleUpdate);
      virtualKeyboard?.removeEventListener?.("geometrychange", scheduleUpdate);
    };
  }, []);

  return { isKeyboardOpen, keyboardHeight };
}
