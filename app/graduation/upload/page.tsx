"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { withViewTransition } from "@/lib/view-transition";

/** Figma 1212-11510: 졸업사정조회 스캔 페이지 */
export default function GraduationUploadPage() {
  useHeaderBackground("white");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (!selectedFile || !previewUrl) return;
    // 이미지 인식 처리 페이지로 이동
    // 개발용: 타입을 변경하여 테스트 가능 (BASIC, DOUBLE, MICRO)
    const majorType = "DOUBLE"; // 여기를 BASIC, DOUBLE, MICRO로 변경하여 테스트
    withViewTransition(() => {
      router.push(`/graduation/upload/processing?image=${encodeURIComponent(previewUrl)}&type=${majorType}`);
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4 pb-4">
        <div className="mb-6">
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            사진에 아래와 같은
          </h1>
          <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
            항목들이 보여야해요.
          </h1>
          <p className="mt-2 text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary">
            정확한 분석을 위해 졸업학점부터 교양선택까지
          </p>
          <p className="mt-1 text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary">
            전체 화면이 보이도록 캡처해주세요.
          </p>
          <p className="mt-1 text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary">
            다중전공자라면 제2전공까지 포함되어야합니다.
          </p>
        </div>

        {/* 졸업사정조회 표 예시 또는 업로드된 이미지 */}
        <div className="mb-8 overflow-x-auto rounded-lg border border-[#EEEFF1] bg-white">
          <div className="relative w-full">
            {previewUrl ? (
              <button
                type="button"
                onClick={handleFileSelectClick}
                className="w-full cursor-pointer"
                aria-label="이미지 다시 선택하기"
              >
                <Image
                  src={previewUrl}
                  alt="업로드된 졸업사정조회 스크린샷"
                  width={800}
                  height={1200}
                  className="w-full h-auto max-h-[1200px]"
                />
              </button>
            ) : (
              <Image
                src="/example/example.png"
                alt="졸업사정조회 표 예시"
                width={800}
                height={1200}
                className="w-full h-auto max-h-[1200px]"
                priority
              />
            )}
          </div>
        </div>

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* 하단 버튼 바 */}
      <div className="shrink-0 flex gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="shrink-0 h-12 w-12 p-0 text-ds-brand [&_svg]:size-6!"
          onClick={handleCameraClick}
          aria-label="촬영하기"
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
          onClick={selectedFile ? handleUpload : handleFileSelectClick}
        >
          {selectedFile ? "다음" : "사진 선택"}
        </Button>
      </div>
    </div>
  );
}
