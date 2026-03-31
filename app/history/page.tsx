"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { HistoryItemPopover } from "@/components/history/history-item-popover";
import { HistoryRow } from "@/components/history/history-row";
import {
  type Conversation,
  listConversations,
  deleteConversation,
  pinConversation,
  renameConversation,
} from "@/lib/api/chat";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  time: string;
  pinned: boolean;
}

function toHistoryItem(conv: Conversation): HistoryItem {
  const d = new Date(conv.createdAt);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { id: conv.id, title: conv.title, date, time, pinned: conv.pinned };
}

export default function HistoryPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popover, setPopover] = useState<{
    item: HistoryItem;
    x: number;
    y: number;
  } | null>(null);

  useHeaderBackground("white");

  useEffect(() => {
    listConversations()
      .then((res) => setItems(res.conversations.map(toHistoryItem)))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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
    const { id, pinned } = popover.item;
    const next = !pinned;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pinned: next } : item))
    );
    pinConversation(id, next).catch(() => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, pinned } : item))
      );
    });
  }, [popover]);

  const handleRename = useCallback(() => {
    if (!popover) return;
    const { id, title } = popover.item;
    const newTitle = window.prompt(t("historyMenu.rename"), title);
    if (!newTitle || newTitle.trim() === "" || newTitle === title) return;
    const trimmed = newTitle.trim();
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: trimmed } : item))
    );
    renameConversation(id, trimmed).catch(() => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, title } : item))
      );
    });
  }, [popover, t]);

  const handleDelete = useCallback(() => {
    if (!popover) return;
    const { id } = popover.item;
    setItems((prev) => prev.filter((item) => item.id !== id));
    deleteConversation(id).catch(() => {
      listConversations()
        .then((res) => setItems(res.conversations.map(toHistoryItem)))
        .catch(() => {});
    });
  }, [popover]);

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
            className="w-full rounded-lg bg-secondary py-4 pl-12 pr-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-body-16-r placeholder:leading-ds-body-16-r placeholder:text-ds-tertiary focus:outline-none"
          />
        </div>
      </div>

      {/* 기록 목록 */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <svg
              className="h-8 w-8 animate-spin text-ds-brand"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : filteredHistory.length === 0 ? (
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
