"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Paperclip, X } from "lucide-react";
import { withViewTransition } from "@/lib/view-transition";
import { cn } from "@/lib/utils";
import { ScrollFade } from "@/components/ui/scroll-fade";
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

/** Figma 1460-5250: 음성 인식 텍스트 더미 (STT 연동 전), 3줄만 노출·이상은 하단 페이드 */
const DUMMY_SPEECH_LINES = [
  { text: "입력한 값이 보이는 곳", color: "text-ds-tertiary" },
  { text: "입력한 값이 보이는 곳", color: "text-ds-secondary" },
  { text: "새로 입력 될 수록 진함", color: "text-ds-primary" },
] as const;

/** Figma 1433-13978: 졸업 캡스톤 - 음성 말하기 화면 */
export default function SpeakPage() {
  const router = useRouter();
  const [micOn, setMicOn] = useState(true);

  const { wavePulse, waveHeights, permissionState, errorMessage } =
    useVoiceAnalyser(micOn);

  const handleClose = () => {
    withViewTransition(() => router.push("/home"));
  };

  const handleMicToggle = () => {
    setMicOn((prev) => !prev);
  };

  return (
    <div
      className="relative flex min-h-full flex-col bg-white"
      style={{
        paddingBottom: "calc(5rem + var(--safe-area-inset-bottom))",
      }}
    >
      {/* 음성 비주얼라이저 - 음성 감지 시 Figma 파도가 나타났다 사라지는 1회 애니메이션 */}
      <div
        className="flex flex-col items-center px-4 pb-4 pt-[calc(3rem+1rem+var(--safe-area-inset-top))]"
        data-name="VoiceVisualizer"
      >
        <div className="flex h-8 items-center justify-center gap-1" aria-hidden>
          {waveHeights.map((h, i) => (
            <motion.div
              key={
                micOn && wavePulse > 0 ? `pulse-${wavePulse}-${i}` : `idle-${i}`
              }
              className="w-0.5 shrink-0 rounded-[10px] bg-primary/50 origin-center"
              initial={{ scaleY: 0.15, opacity: 1 }}
              animate={
                micOn && wavePulse > 0
                  ? {
                      scaleY: [0.15, 1, 1, 0.15],
                      opacity: [1, 1, 1, 1],
                    }
                  : { scaleY: 0.15, opacity: 1 }
              }
              transition={{
                duration: micOn ? 0.85 : 0.2,
                times: micOn ? [0, 0.22, 0.55, 0.85] : undefined,
                ease: "easeOut",
              }}
              style={{ height: h }}
              data-name="VoiceVisualizer/el"
            />
          ))}
        </div>
      </div>

      {/* 음성 인식 텍스트: 비주얼라이저·원 중간(절대 위치), 3줄만 노출 */}
      <div
        className="absolute left-0 right-0 z-1 flex justify-center px-4"
        style={{
          top: "calc(3rem + 1rem + var(--safe-area-inset-top) + 2rem + 1rem + (50vh - (3rem + 1rem + var(--safe-area-inset-top) + 2rem + 1rem)) * 0.2)",
          transform: "translateY(-50%)",
        }}
      >
        <ScrollFade
          axis="y"
          fadeSize={24}
          fadeColor="white"
          showBottom={false}
          className="relative flex max-h-18 w-full max-w-(--app-max-width) flex-col items-center justify-center overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center gap-0">
            {DUMMY_SPEECH_LINES.map((line, i) => (
              <p
                key={i}
                className={cn(
                  "shrink-0 text-center text-ds-body-16-r leading-ds-body-16-r tracking-[-0.4px]",
                  line.color
                )}
              >
                {line.text}
              </p>
            ))}
          </div>
        </ScrollFade>
      </div>

      {/* 화면 중앙 원: mic On일 때만 144→192→144 크기 반복, Off일 때 정지 */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        <motion.div
          className="size-[144px] shrink-0 rounded-full bg-primary"
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: micOn ? [1, 192 / 144, 1] : 1,
          }}
          transition={{
            y: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
            opacity: { duration: 0.5 },
            scale: micOn
              ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 },
          }}
          aria-hidden
        />
      </div>

      {/* 마이크 권한 에러/거부 시 안내 (필요 시 노출) */}
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

        {/* Btn - 마이크 (on/off 토글) */}
        <button
          type="button"
          onClick={handleMicToggle}
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
