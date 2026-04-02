"use client";

import { useLongPress } from "@/hooks/use-long-press";
import { Pin } from "lucide-react";

export interface HistoryRowProps {
  item: {
    id: string;
    title: string;
    date: string;
    time: string;
    pinned: boolean;
  };
  onLongPress: (item: HistoryRowProps["item"], e: React.TouchEvent | React.MouseEvent) => void;
  onClick: () => void | Promise<void>;
}

export function HistoryRow({ item, onLongPress, onClick }: HistoryRowProps) {
  const longPress = useLongPress(
    (e) => onLongPress(item, e),
    { duration: 150 }
  );

  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
      {...longPress}
      className="w-full py-4 text-left transition-opacity active:opacity-70"
    >
      <div className="mb-1 flex items-center gap-2">
        {item.pinned && (
          <Pin
            className="shrink-0 text-ds-primary"
            style={{ width: 20, height: 20 }}
            aria-hidden
          />
        )}
        <p className="font-semibold text-ds-body-16-sb leading-ds-body-16-sb text-ds-gray-90">
          {item.title}
        </p>
      </div>
      <p className="font-normal text-ds-caption-14-r leading-ds-caption-14-r text-ds-gray-50">
        {item.date} {item.time}
      </p>
    </button>
  );
}
