"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { withViewTransition } from "@/lib/view-transition";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const PROCESSING_STEPS = [
  "timetableScan.processing.step1",
  "timetableScan.processing.step2",
  "timetableScan.processing.step3",
];

const STEP_DURATION_MS = 1200;

/** Figma 1229-19838: 최신 시간표 스캔 처리 중 페이지 */
export default function TimetableScanProcessingPage() {
  useHeaderBackground("white");
  const router = useRouter();
  const { t } = useTranslation();

  const [stepIndex, setStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    PROCESSING_STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(
          () => setStepIndex(i),
          i * STEP_DURATION_MS,
        ),
      );
    });

    timers.push(
      setTimeout(
        () => setIsDone(true),
        PROCESSING_STEPS.length * STEP_DURATION_MS,
      ),
    );

    timers.push(
      setTimeout(
        () => withViewTransition(() => router.replace("/graduation/result")),
        PROCESSING_STEPS.length * STEP_DURATION_MS + 1000,
      ),
    );

    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center bg-white px-8">
      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-8"
          >
            {/* 스피너 */}
            <div className="relative h-16 w-16">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-[#EEEFF1]"
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-ds-brand"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* 단계 텍스트 */}
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-ds-body-16-sb font-semibold text-ds-primary">
                {t("graduation.timetableScan.processing.title")}
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-ds-caption-14-r text-ds-tertiary"
                >
                  {t(PROCESSING_STEPS[stepIndex])}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* 진행 바 */}
            <div className="h-1 w-48 overflow-hidden rounded-full bg-[#EEEFF1]">
              <motion.div
                className="h-full rounded-full bg-ds-brand"
                initial={{ width: "0%" }}
                animate={{
                  width: `${((stepIndex + 1) / PROCESSING_STEPS.length) * 100}%`,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center gap-4 text-center"
          >
            {/* 완료 아이콘 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-ds-brand"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>

            <div className="flex flex-col gap-1">
              <p className="text-ds-body-16-sb font-semibold text-ds-primary">
                {t("graduation.timetableScan.processing.complete")}
              </p>
              <p className="text-ds-caption-14-r text-ds-tertiary">
                {t("graduation.timetableScan.processing.completeSubtitle")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
