"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Paperclip, X } from "lucide-react";
import { withViewTransition } from "@/lib/view-transition";
import { cn } from "@/lib/utils";
import { useVoiceAnalyser } from "@/hooks/use-voice-analyser";

/** mic-on.svg 기반 - currentColor로 brand 색상 적용 가능 */
function MicOnIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12 19V22"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 10V12C19 13.8565 18.2625 15.637 16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.7375 15.637 5 13.8565 5 12V10"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** mic-off.svg 기반 - currentColor로 tertiary 색상 적용 */
function MicOffIcon({ className }: { className?: string }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12 19V22"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 10V12C19 13.8565 18.2625 15.637 16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.7375 15.637 5 13.8565 5 12V10"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.75 11.1641V12C9.75 13.2426 10.7574 14.25 12 14.25C12.2509 14.25 12.4914 14.2066 12.7168 14.1309L13.8477 15.2617C13.3021 15.5714 12.6722 15.75 12 15.75C9.92893 15.75 8.25 14.0711 8.25 12V9.66406L9.75 11.1641ZM12 1.25C14.0711 1.25 15.75 2.92893 15.75 5V12C15.75 12.6722 15.5714 13.3021 15.2617 13.8477L14.1309 12.7168C14.2066 12.4914 14.25 12.2509 14.25 12V5C14.25 3.75736 13.2426 2.75 12 2.75C10.7574 2.75 9.75 3.75736 9.75 5V8.33594L8.25 6.83594V5C8.25 2.92893 9.92893 1.25 12 1.25Z"
        fill="currentColor"
      />
      <path
        d="M4 4L20 20"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

const btnBase =
  "flex size-14 shrink-0 items-center justify-center rounded-[28px] bg-(--ds-gray-5) hover:bg-(--ds-gray-10) active:opacity-80";

/** Figma 1433-13978: 졸업 캡스톤 - 음성 말하기 화면 */
export default function SpeakPage() {
  const router = useRouter();
  const [micOn, setMicOn] = useState(true);

  const {
    barHeights,
    audioLevel,
    permissionState,
    errorMessage,
    requestPermission,
  } = useVoiceAnalyser(micOn);

  const handleClose = () => {
    withViewTransition(() => router.push("/home"));
  };

  const handleMicToggle = () => {
    setMicOn((prev) => !prev);
  };

  const handleStartVoice = () => {
    requestPermission();
  };

  return (
    <div
      className="flex min-h-full flex-col bg-white"
      style={{
        paddingBottom: "calc(5rem + var(--safe-area-inset-bottom))",
      }}
    >
      {/* 음성 비주얼라이저 - 헤더 위치, 사용자 음성에 따라 파도형 애니메이션 */}
      <div
        className="flex flex-col items-center px-4 pb-4 pt-[calc(3rem+1rem+var(--safe-area-inset-top))]"
        data-name="VoiceVisualizer"
      >
        <div className="flex h-6 items-end justify-center gap-1" aria-hidden>
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="w-0.5 shrink-0 rounded-[10px] bg-primary/50 transition-[height] duration-75 ease-out"
              style={{ height: h }}
              data-name="VoiceVisualizer/el"
            />
          ))}
        </div>
        {/* 음성 수신 확인: 권한 허용 시 상태 표시 */}
        {permissionState === "granted" && (
          <p className="mt-2 text-center text-ds-caption-14-r leading-ds-caption-14-r text-ds-tertiary">
            음성 수신 중
            <span className="ml-1.5 font-medium text-ds-brand">
              {audioLevel}%
            </span>
          </p>
        )}
      </div>

      {/* 나머지 공간 */}
      <div className="flex-1" />

      {/* 화면 중앙 원 애니메이션: 144→192→144 크기 반복 */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        <motion.div
          className="size-[144px] shrink-0 rounded-full bg-primary"
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: [1, 192 / 144, 1],
          }}
          transition={{
            y: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
            opacity: { duration: 0.5 },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          aria-hidden
        />
      </div>

      {/* 모바일: 권한 팝업이 사용자 제스처 직후에만 뜨므로, 탭 시 권한 요청 */}
      {(permissionState === "idle" || permissionState === "requesting") &&
        micOn && (
          <button
            type="button"
            onClick={handleStartVoice}
            disabled={permissionState === "requesting"}
            className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-white/90 px-6 py-8"
            aria-label="음성 사용 시작"
          >
            <span className="text-center text-ds-body-16-r leading-ds-body-16-r text-ds-primary">
              {permissionState === "requesting"
                ? "마이크 권한 요청 중..."
                : "음성 사용을 시작하려면\n화면을 탭하세요"}
            </span>
          </button>
        )}
      {permissionState === "denied" && (
        <p className="absolute left-4 right-4 top-1/2 z-10 -translate-y-1/2 text-center text-sm text-ds-tertiary">
          마이크 권한이 필요합니다. 브라우저 설정에서 허용해주세요.
        </p>
      )}
      {permissionState === "error" && errorMessage && (
        <p className="absolute left-4 right-4 top-1/2 z-10 -translate-y-1/2 text-center text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {/* 하단 액션 바: Clip | Mic | X (모바일 safe area 대응, fixed로 항상 노출) */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between bg-white px-4 pt-4"
        style={{
          paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
          maxWidth: "var(--app-max-width)",
          margin: "0 auto",
        }}
      >
        {/* Btn/Clip - 첨부 */}
        <button
          type="button"
          className={cn(btnBase, "text-ds-tertiary")}
          aria-label="첨부"
        >
          <Paperclip className="size-6" strokeWidth={1.5} />
        </button>

        {/* Btn - 마이크 (on/off 토글). 아직 권한 요청 전이면 탭 시 권한 요청 후 분석 시작 */}
        <button
          type="button"
          onClick={() => {
            if (permissionState === "idle" && micOn) {
              handleStartVoice();
              return;
            }
            handleMicToggle();
          }}
          className={cn(
            btnBase,
            micOn ? "text-ds-brand" : "text-ds-tertiary"
          )}
          aria-label={micOn ? "마이크 끄기" : "마이크 켜기"}
        >
          {micOn ? (
            <MicOnIcon className="size-6 shrink-0" />
          ) : (
            <MicOffIcon className="size-6 shrink-0" />
          )}
        </button>

        {/* Btn/X - 닫기 */}
        <button
          type="button"
          onClick={handleClose}
          className={cn(btnBase, "text-ds-tertiary")}
          aria-label="닫기"
        >
          <X className="size-6" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
