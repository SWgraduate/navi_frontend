"use client";

import { useLongPress } from "@/hooks/use-long-press";

export interface HistoryRowItem {
  id: string;
  title: string;
  date: string;
  time: string;
}

export interface HistoryRowProps {
  item: HistoryRowItem;
  onLongPress: (item: HistoryRowItem, e: React.TouchEvent | React.MouseEvent) => void;
  onClick: () => void;
}

export function HistoryRow({ item, onLongPress, onClick }: HistoryRowProps) {
  const longPress = useLongPress(
    (e) => onLongPress(item, e),
    { duration: 200 }
  );

  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
      {...longPress}
      className="w-full py-4 text-left transition-opacity active:opacity-70"
    >
      <p className="mb-1 font-semibold text-ds-body-16-sb leading-ds-body-16-sb text-ds-gray-90">
        {item.title}
      </p>
      <p className="font-normal text-ds-caption-14-r leading-ds-caption-14-r text-ds-gray-50">
        {item.date} {item.time}
      </p>
    </button>
  );
}
