"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { withViewTransition } from "@/lib/view-transition";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AttachmentMenu } from "@/components/ui/attachment-menu";
import { AttachmentFileCard, AttachmentImageCard } from "@/components/ui/attachment-card";
import { useVoiceAnalyser } from "@/hooks/use-voice-analyser";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { useChat } from "@/contexts/chat-context";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

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
  const { t } = useTranslation();
  const { conversationId, ensureConversation } = useChat();
  const [chatId, setChatId] = useState<string | null>(conversationId);
  const [chatIdError, setChatIdError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<
    { id: string; file: File; previewUrl?: string }[]
  >([]);
  const clipButtonRef = useRef<HTMLButtonElement>(null);
  const subtitleEndRef = useRef<HTMLDivElement>(null);

  // 페이지 진입 시 conversationId 확보
  useEffect(() => {
    if (!chatId) {
      ensureConversation()
        .then(setChatId)
        .catch((err) =>
          setChatIdError(err instanceof Error ? err.message : "대화를 시작할 수 없습니다.")
        );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 마이크 시각화는 항상 micOn에 연동 (세션과 독립적으로 파동 표시)
  const { bandLevels, permissionState, errorMessage } = useVoiceAnalyser(micOn);

  const {
    status: sessionStatus,
    sttTranscript,
    sttIsFinal,
    ttsText,
    pastLines,
    error: sessionError,
  } = useVoiceSession(chatId, micOn && !!chatId);

  // 새 자막 추가 시 하단으로 스크롤
  useEffect(() => {
    subtitleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pastLines]);

  const handleFileSelect = (files: File[]) => {
    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const previewUrl =
          file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        return { id, file, previewUrl };
      }),
    ]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

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
          {bandLevels.map((level, i) => {
            const normalized = micOn ? level / 100 : 0;
            const centerIndex = (bandLevels.length - 1) / 2;
            const distFromCenter = Math.abs(i - centerIndex);
            const t = distFromCenter / centerIndex; // 0(중앙) ~ 1(끝)
            const centerWeight = 1 - t * t; // 중앙 1, 양 끝 0로 부드럽게 감소
            const emphasis = 0.3 + centerWeight * 0.9; // 0.3~1.2 사이 가중치
            const scaleY = 0.2 + normalized * emphasis * 2.0;

            return (
              <motion.div
                key={`bar-${i}`}
                className="w-0.5 shrink-0 rounded-[10px] bg-primary/50 origin-center"
                initial={{ scaleY: 0.15, opacity: 1 }}
                animate={{
                  scaleY: micOn ? scaleY : 0.15,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.08,
                  ease: "linear",
                }}
                style={{ height: 32 }}
                data-name="VoiceVisualizer/el"
              />
            );
          })}
        </div>
      </div>

      {/* 음성 인식 텍스트: 비주얼라이저·원 중간(절대 위치), STT/TTS 실시간 표시 */}
      <div
        className="absolute left-0 right-0 z-1 flex justify-center px-4"
        style={{
          top: "calc(3rem + 1rem + var(--safe-area-inset-top) + 2rem + 1rem + (50vh - (3rem + 1rem + var(--safe-area-inset-top) + 2rem + 1rem)) * 0.3)",
          transform: "translateY(-50%)",
        }}
      >
        <div className="relative flex w-full max-w-(--app-max-width) flex-col items-center gap-1">
          {/* 과거 자막: 위쪽 fade, 스크롤 */}
          {pastLines.length > 0 && (
            <div className="relative w-full overflow-hidden" style={{ maxHeight: "8rem" }}>
              <div
                className="pointer-events-none absolute left-0 right-0 top-0 z-10"
                style={{
                  height: 32,
                  background: "linear-gradient(to bottom, white, transparent)",
                }}
                aria-hidden
              />
              <div className="flex flex-col items-center gap-0.5 overflow-y-auto" style={{ maxHeight: "8rem" }}>
                {pastLines.map((line, i) => (
                  <p
                    key={i}
                    className={cn(
                      "w-full text-center text-ds-body-16-r leading-ds-body-16-r tracking-[-0.4px]",
                      line.type === "tts" ? "text-ds-brand" : "text-ds-tertiary"
                    )}
                  >
                    {line.text}
                  </p>
                ))}
                <div ref={subtitleEndRef} />
              </div>
            </div>
          )}

          {/* 현재 자막: 페이드 없이 항상 선명하게 */}
          {chatIdError ? (
            <p className="shrink-0 text-center text-ds-body-16-r leading-ds-body-16-r tracking-[-0.4px] text-destructive">
              {chatIdError}
            </p>
          ) : sttTranscript && !sttIsFinal ? (
            <p className="shrink-0 text-center text-ds-body-16-r leading-ds-body-16-r tracking-[-0.4px] text-ds-primary">
              {sttTranscript}
            </p>
          ) : !sttTranscript && pastLines.length === 0 ? (
            <p
              className={cn(
                "shrink-0 text-center text-ds-body-16-r leading-ds-body-16-r tracking-[-0.4px]",
                sessionStatus === "error" ? "text-destructive" : "text-ds-tertiary"
              )}
            >
              {!chatId
                ? t("speak.connecting")
                : sessionStatus === "connecting"
                  ? t("speak.connecting")
                  : sessionStatus === "connected"
                    ? t("speak.listening")
                    : sessionStatus === "error"
                      ? (sessionError ?? t("speak.error"))
                      : t("speak.tapToSpeak")}
            </p>
          ) : null}
        </div>
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

      {/* 마이크 권한 에러/거부 시 안내 */}
      {permissionState === "denied" && (
        <p className="absolute left-4 right-4 top-1/2 z-10 -translate-y-1/2 text-center text-sm text-ds-tertiary">
          {t("speak.permissionDenied")}
        </p>
      )}
      {permissionState === "error" && errorMessage && (
        <p className="absolute left-4 right-4 top-1/2 z-10 -translate-y-1/2 text-center text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {/* Figma 1650-15068: 첨부 카드 영역 - 파일/이미지 카드 가로 스크롤 */}
      {attachments.length > 0 && (
        <div
          className="fixed bottom-[calc(8rem+var(--safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 gap-1 overflow-x-auto px-4"
          style={{
            maxWidth: "var(--app-max-width)",
            width: "100%",
          }}
        >
          {attachments.map(({ id, file, previewUrl }) =>
            previewUrl ? (
              <AttachmentImageCard
                key={id}
                previewUrl={previewUrl}
                onRemove={() => removeAttachment(id)}
              />
            ) : (
              <AttachmentFileCard
                key={id}
                file={file}
                onRemove={() => removeAttachment(id)}
              />
            )
          )}
        </div>
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
        {/* Btn/Clip - 첨부 (메뉴: 파일/앨범/카메라) */}
        <button
          ref={clipButtonRef}
          type="button"
          onClick={() => setAttachMenuOpen((o) => !o)}
          className={cn(btnBase, "text-ds-tertiary")}
          aria-label={t("speak.attach")}
          aria-expanded={attachMenuOpen}
          aria-haspopup="menu"
        >
          <Image src="/icons/clip.svg" alt="" width={24} height={24} className="size-6 shrink-0" />
        </button>
        <AttachmentMenu
          anchorRef={clipButtonRef}
          open={attachMenuOpen}
          onClose={() => setAttachMenuOpen(false)}
          onFileSelect={handleFileSelect}
          onPhotoSelect={handleFileSelect}
          onCameraCapture={handleFileSelect}
        />

        {/* Btn - 마이크 (on/off 토글) */}
        <button
          type="button"
          onClick={handleMicToggle}
          className={cn(
            btnBase,
            micOn ? "text-ds-brand" : "text-ds-tertiary"
          )}
          aria-label={micOn ? t("speak.micOn") : t("speak.micOff")}
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
          aria-label={t("speak.close")}
        >
          <X className="size-6" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
