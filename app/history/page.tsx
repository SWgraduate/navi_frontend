"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderBackground } from "@/hooks/use-header-background";

/* 목데이터 – API 연동 시 제거 후 실제 데이터로 교체 */
interface HistoryItem {
  id: string;
  title: string;
  date: string;
  time: string;
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    title: "example 1",
    date: "xxxx-xx-xx",
    time: "00:00",
  },
  {
    id: "2",
    title: "example 2",
    date: "xxxx-xx-xx",
    time: "00:00",
  },
  {
    id: "3",
    title: "example 3",
    date: "xxxx-xx-xx",
    time: "00:00",
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useHeaderBackground("white");

  const filteredHistory = MOCK_HISTORY.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            placeholder="전공을 검색하세요."
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
              검색 결과가 없습니다.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ds-gray-20">
            {filteredHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  // TODO: 기록 상세 페이지로 이동 또는 채팅 재개
                }}
                className="w-full py-4 text-left transition-opacity active:opacity-70"
              >
                <p className="mb-1 font-semibold text-ds-body-16-sb leading-ds-body-16-sb text-ds-gray-90">
                  {item.title}
                </p>
                <p className="font-normal text-ds-caption-14-r leading-ds-caption-14-r text-ds-gray-50">
                  {item.date} {item.time}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
