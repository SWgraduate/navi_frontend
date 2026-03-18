"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { withViewTransition } from "@/lib/view-transition";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

interface ImageItem {
  file: File;
  url: string;
}

/** Figma 1229-19838: 최신 시간표 스캔 페이지 */
export default function TimetableScanPage() {
  useHeaderBackground("white");
  const router = useRouter();
  const { t } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((idx: number) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollTo({
      left: idx * carouselRef.current.clientWidth,
      behavior: "smooth",
    });
    setActiveIndex(idx);
  }, []);

  const addImages = useCallback(
    (files: FileList) => {
      const newItems: ImageItem[] = Array.from(files).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setImages((prev) => {
        const updated = [...prev, ...newItems];
        const lastIdx = updated.length - 1;
        setTimeout(() => scrollToIndex(lastIdx), 50);
        return updated;
      });
    },
    [scrollToIndex],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addImages(e.target.files);
    }
    e.target.value = "";
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    if (clientWidth > 0) {
      setActiveIndex(Math.round(scrollLeft / clientWidth));
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      const updated = prev.filter((_, i) => i !== idx);
      const newActive = Math.min(idx, Math.max(0, updated.length - 1));
      setTimeout(() => {
        if (updated.length > 0) scrollToIndex(newActive);
        else setActiveIndex(0);
      }, 50);
      return updated;
    });
  };

  const handleNext = () => {
    withViewTransition(() =>
      router.push("/graduation/timetable-scan/processing"),
    );
  };

  const hasImages = images.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4 pb-4">
        {/* 안내 문구 */}
        <div className="mb-6">
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            {t("graduation.timetableScan.title1")}
          </h1>
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            {t("graduation.timetableScan.title2")}
          </h1>
          <p className="mt-2 text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary">
            {t("graduation.timetableScan.caption1")}
          </p>
          <p className="mt-1 text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary">
            {t("graduation.timetableScan.caption2")}
          </p>
          <p className="mt-1 text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary">
            {t("graduation.timetableScan.caption3")}
          </p>
        </div>

        {/* 이미지 영역 */}
        <div className="overflow-hidden rounded-lg border border-[#EEEFF1] bg-white">
          {hasImages ? (
            <div className="relative">
              {/* 이미지 카운트 배지 */}
              <div className="absolute left-2 top-2 z-10 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white select-none">
                {activeIndex + 1} / {images.length}
              </div>

              {/* 추가 버튼 */}
              <button
                type="button"
                className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white"
                onClick={() => fileInputRef.current?.click()}
                aria-label={t("graduation.timetableScan.addMore")}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {t("graduation.timetableScan.addMore")}
              </button>

              {/* 캐러셀 */}
              <div
                ref={carouselRef}
                className="flex overflow-x-auto"
                style={{
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                onScroll={handleScroll}
              >
                {images.map((img, idx) => (
                  <div
                    key={img.url}
                    className="relative w-full shrink-0"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    {/* 이미지 제거 버튼 */}
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
                      onClick={() => removeImage(idx)}
                      aria-label={`${idx + 1}번 이미지 제거`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>

                    <Image
                      src={img.url}
                      alt={t("graduation.timetableScan.altUploaded", {
                        index: idx + 1,
                      })}
                      width={800}
                      height={1200}
                      className="h-auto max-h-[420px] w-full object-contain"
                      unoptimized
                    />
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <Image
              src="/example/example_timetable.png"
              alt={t("graduation.timetableScan.altExample")}
              width={800}
              height={800}
              className="h-auto w-full"
              priority
            />
          )}
        </div>

        {/* 닷 인디케이터 (박스 바깥) */}
        {hasImages && images.length > 1 && (
          <div className="flex justify-center gap-1.5 pt-3">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}번 이미지로 이동`}
                onClick={() => scrollToIndex(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === activeIndex
                    ? "h-1.5 w-4 bg-ds-brand"
                    : "h-1.5 w-1.5 bg-[#EEEFF1]"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="shrink-0 flex gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="h-12 w-12 shrink-0 p-0 text-ds-brand [&_svg]:size-6!"
          onClick={() => cameraInputRef.current?.click()}
          aria-label={t("graduation.timetableScan.camera")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            aria-hidden
          >
            <path
              d="M13.997 4C14.3578 3.99999 14.7119 4.09759 15.0217 4.28244C15.3316 4.46729 15.5856 4.73251 15.757 5.05L16.243 5.95C16.4144 6.26749 16.6684 6.53271 16.9783 6.71756C17.2881 6.90241 17.6422 7.00001 18.003 7H20C20.5304 7 21.0391 7.21071 21.4142 7.58579C21.7893 7.96086 22 8.46957 22 9V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V9C2 8.46957 2.21071 7.96086 2.58579 7.58579C2.96086 7.21071 3.46957 7 4 7H5.997C6.35742 7.00002 6.71115 6.90264 7.02078 6.71817C7.33041 6.53369 7.58444 6.26897 7.756 5.952L8.245 5.048C8.41656 4.73103 8.67059 4.46631 8.98022 4.28183C9.28985 4.09736 9.64358 3.99998 10.004 4H13.997Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          className="flex-1 text-white"
          onClick={hasImages ? handleNext : () => fileInputRef.current?.click()}
        >
          {hasImages
            ? t("graduation.timetableScan.next")
            : t("graduation.timetableScan.selectPhoto")}
        </Button>
      </div>

      {/* 숨겨진 파일 입력 (갤러리, 다중 선택) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      {/* 숨겨진 카메라 입력 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
