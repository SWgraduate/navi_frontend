"use client";

import { useCallback, useRef } from "react";

const DEFAULT_DURATION_MS = 500;

/**
 * 터치/마우스 롱프레스 감지.
 * duration 후에 onLongPress 호출. 이동/해제 시 취소.
 */
export function useLongPress(
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void,
  options: { duration?: number } = {}
) {
  const duration = options.duration ?? DEFAULT_DURATION_MS;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetRef = useRef<EventTarget | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    targetRef.current = null;
  }, []);

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      targetRef.current = e.currentTarget;
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        onLongPress(e);
      }, duration);
    },
    [onLongPress, duration]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      start(e);
    },
    [start]
  );

  const handleTouchMove = useCallback(() => {
    clear();
  }, [clear]);

  const handleTouchEnd = useCallback(() => {
    clear();
  }, [clear]);

  const handleTouchCancel = useCallback(() => {
    clear();
  }, [clear]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      start(e);
    },
    [start]
  );

  const handleMouseUp = useCallback(() => {
    clear();
  }, [clear]);

  const handleMouseLeave = useCallback(() => {
    clear();
  }, [clear]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
  };
}
