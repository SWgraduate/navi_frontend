"use client";

import { useCallback, useMemo, useState } from "react";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { HistoryItemPopover } from "@/components/history/history-item-popover";
import { HistoryRow } from "@/components/history/history-row";
import { getPinnedMap, togglePinned } from "@/lib/history-storage";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

/* 목데이터 – API 연동 시 제거 후 실제 데이터로 교체 */
interface HistoryItem {
  id: string;
  title: string;
  date: string;
  time: string;
  pinned: boolean;
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    title: "example 1",
    date: "xxxx-xx-xx",
    time: "00:00",
    pinned: false,
  },
  {
    id: "2",
    title: "example 2",
    date: "xxxx-xx-xx",
    time: "00:00",
    pinned: false,
  },
  {
    id: "3",
    title: "example 3",
    date: "xxxx-xx-xx",
    time: "00:00",
    pinned: false,
  },
];

export default function HistoryPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<HistoryItem[]>(() => {
    const pinnedMap = getPinnedMap();
    return MOCK_HISTORY.map((item) => ({
      ...item,
      pinned: !!pinnedMap[item.id],
    }));
  });
  const [popover, setPopover] = useState<{
    item: HistoryItem;
    x: number;
    y: number;
  } | null>(null);

  useHeaderBackground("white");

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const byQuery = q.length
      ? items.filter((item) => item.title.toLowerCase().includes(q))
      : items;

    return [...byQuery].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [items, searchQuery]);

  const handleLongPress = useCallback((item: HistoryItem, e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? e.changedTouches?.[0]?.clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY ?? e.changedTouches?.[0]?.clientY : e.clientY;
    if (clientX != null && clientY != null) {
      setPopover({ item, x: clientX, y: clientY });
    }
  }, []);

  const closePopover = useCallback(() => setPopover(null), []);

  const handlePin = useCallback(() => {
    if (!popover) return;
    const { id } = popover.item;

    setItems((prev) => {
      const current = prev.find((item) => item.id === id);
      const isPinned = current?.pinned ?? false;
      togglePinned(id, isPinned);
      return prev.map((item) =>
        item.id === id ? { ...item, pinned: !isPinned } : item
      );
    });
  }, [popover]);
  const handleRename = useCallback(() => {
    // TODO: 이름 변경
  }, []);
  const handleDelete = useCallback(() => {
    // TODO: 삭제 API
  }, []);

  return (
    <div className="min-h-full bg-white">
      {/* 검색 바 */}
      <div className="px-4 pt-4 pb-3">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-ds-tertiary"
            >
              <path
                d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                stroke="currentColor"
                strokeWidth="1.0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 14L11.1 11.1"
                stroke="currentColor"
                strokeWidth="1.0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t("history.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-secondary py-4 pl-12 pr-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-body-16-r placeholder:leading-ds-body-16-r placeholder:text-ds-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* 기록 목록 */}
      <div className="px-4">
        {filteredHistory.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-ds-body-16-r leading-ds-body-16-r text-ds-gray-50">
              {t("history.noResults")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ds-gray-20">
            {filteredHistory.map((item) => (
              <HistoryRow
                key={item.id}
                item={item}
                onLongPress={handleLongPress}
                onClick={() => {
                  if (popover?.item.id === item.id) return;
                  // TODO: 기록 상세 페이지로 이동 또는 채팅 재개
                }}
              />
            ))}
          </div>
        )}
        {popover && (
          <HistoryItemPopover
            x={popover.x}
            y={popover.y}
            onClose={closePopover}
            isPinned={popover.item.pinned}
            onPin={handlePin}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
