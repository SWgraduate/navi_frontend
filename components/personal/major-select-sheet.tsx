"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

/** top/bottom으로 열고 닫아서 transform 미사용 → 모바일 터치 좌표 어긋남 방지 */
const sheetOverlayVariants = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
};

const sheetPanelVariants = {
  open: { top: "auto" as const, bottom: 0 },
  closed: { top: "100%", bottom: "auto" as const },
};

type MajorSelectSheetProps = {
  open: boolean;
  selected: string;
  options: readonly string[];
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
  title?: string;
};

const DRAG_CLOSE_OFFSET = 80;
const DRAG_CLOSE_VELOCITY = 300;

export function MajorSelectSheet({
  open,
  selected,
  options,
  onOpenChange,
  onSelect,
  title = "주전공을 선택해주세요",
}: MajorSelectSheetProps) {
  const dragControls = useDragControls();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((m) => m.toLowerCase().includes(q));
  }, [options, search]);

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

  const handleSelect = (value: string) => {
    const next = selected === value ? "" : value;
    onSelect(next);
    setSearch("");
    handleClose();
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
            aria-label={title}
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
                <h2 className="pointer-events-none text-center text-ds-title-18-sb leading-ds-title-18-sb font-semibold text-ds-primary">
                  {title}
                </h2>
              </div>
              <div className="relative flex min-h-[48px] items-center rounded-md border-2 border-transparent bg-secondary focus-within:border-primary">
                <Search
                  className="pointer-events-none absolute left-3 h-5 w-5 shrink-0 text-ds-tertiary"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="전공을 검색하세요"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full min-h-[48px] rounded-md bg-transparent py-3 pl-10 pr-4 text-ds-body-16-r leading-ds-body-16-r text-ds-gray-90 placeholder:text-ds-tertiary focus:outline-none focus:ring-0 touch-manipulation"
                />
              </div>
            </div>
            <ul className="flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden px-4 max-h-[60vh] touch-manipulation [-webkit-overflow-scrolling:touch]">
              {filtered.map((m) => (
                <li key={m} className="flex">
                  <button
                    type="button"
                    onClick={() => handleSelect(m)}
                    className="w-full min-h-[48px] cursor-pointer select-none py-3.5 px-4 text-left text-ds-body-16-r leading-ds-body-16-r text-ds-primary active:bg-(--ds-gray-10) touch-manipulation"
                  >
                    {m}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="py-4 text-center text-ds-caption-14-r text-ds-tertiary">
                  검색 결과가 없습니다
                </li>
              )}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

