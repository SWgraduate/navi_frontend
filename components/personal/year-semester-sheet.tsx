"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useEffect, useState } from "react";

const sheetOverlayVariants = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
};

/** top/bottom으로 열고 닫아서 transform 미사용 → 모바일 터치 좌표 어긋남 방지 */
const sheetPanelVariants = {
  open: { top: "auto" as const, bottom: 0 },
  closed: { top: "100%", bottom: "auto" as const },
};

const YEAR_OPTIONS = [1, 2, 3, 4] as const;
const SEMESTER_OPTIONS = [1, 2] as const;

type YearSemesterSheetProps = {
  open: boolean;
  value: string; // "N-N" 형식, 예: "3-2"
  onOpenChange: (open: boolean) => void;
  onChange: (next: string) => void;
};

const DRAG_CLOSE_OFFSET = 80;
const DRAG_CLOSE_VELOCITY = 300;

export function YearSemesterSheet({
  open,
  value,
  onOpenChange,
  onChange,
}: YearSemesterSheetProps) {
  const dragControls = useDragControls();
  const [sheetYear, setSheetYear] = useState<number | null>(null);
  const [sheetSemester, setSheetSemester] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    if (value && value.includes("-")) {
      const [y, s] = value.split("-").map(Number);
      setSheetYear(y);
      setSheetSemester(s);
    } else {
      setSheetYear(null);
      setSheetSemester(null);
    }
  }, [open, value]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { y: number }; velocity: { y: number } }
  ) => {
    if (info.offset.y > DRAG_CLOSE_OFFSET || info.velocity.y > DRAG_CLOSE_VELOCITY) {
      handleClose();
    }
  };

  const handleConfirm = () => {
    if (sheetYear != null && sheetSemester != null) {
      onChange(`${sheetYear}-${sheetSemester}`);
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden
            onClick={handleClose}
            variants={sheetOverlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] h-fit flex-col rounded-t-xl bg-white shadow-lg pb-[max(1rem,env(safe-area-inset-bottom))]"
            role="dialog"
            aria-modal
            aria-labelledby="year-semester-sheet-title"
            variants={sheetPanelVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ bottom: 0.25 }}
            dragListener={false}
            dragControls={dragControls}
            onDragEnd={handleDragEnd}
          >
            <div className="flex shrink-0 flex-col gap-2 px-4 pt-2">
              <div
                className="flex min-h-[56px] cursor-grab active:cursor-grabbing flex-col items-center justify-center gap-2 py-2 touch-none"
                aria-hidden
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="h-1.5 w-12 rounded-full bg-[#EEEFF1]" />
                <h2
                  id="year-semester-sheet-title"
                  className="pointer-events-none text-center text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary"
                >
                  학년 / 학기를 선택해주세요
                </h2>
              </div>
            </div>
            <div className="flex gap-4 p-4">
              <div className="min-w-0 flex-1">
                <ul className="flex flex-col gap-2">
                  {YEAR_OPTIONS.map((y) => (
                    <li key={y} className="flex">
                      <button
                        type="button"
                        onClick={() => setSheetYear(sheetYear === y ? null : y)}
                        className={
                          "w-full min-h-[52px] cursor-pointer select-none rounded-md py-5 text-center text-ds-body-16-r leading-ds-body-16-r touch-manipulation" +
                          (sheetYear === y ? " bg-primary/10 font-semibold text-ds-primary" : " text-ds-primary")
                        }
                      >
                        {y}학년
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="min-w-0 flex-1">
                <ul className="flex flex-col gap-2">
                  {SEMESTER_OPTIONS.map((s) => (
                    <li key={s} className="flex">
                      <button
                        type="button"
                        onClick={() => setSheetSemester(sheetSemester === s ? null : s)}
                        className={
                          "w-full min-h-[52px] cursor-pointer select-none rounded-md py-5 text-center text-ds-body-16-r leading-ds-body-16-r touch-manipulation" +
                          (sheetSemester === s ? " bg-primary/10 font-semibold text-ds-primary" : " text-ds-primary")
                        }
                      >
                        {s}학기
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="shrink-0 px-4 pb-12">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={sheetYear == null || sheetSemester == null}
                className={
                  "min-h-[52px] w-full cursor-pointer select-none rounded-md py-5 text-ds-body-16-sb leading-ds-body-16-sb touch-manipulation" +
                  (sheetYear != null && sheetSemester != null
                    ? " bg-primary text-primary-foreground"
                    : " bg-[#EEEFF1] text-ds-disabled")
                }
              >
                완료
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

