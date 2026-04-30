"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useHeaderBackground } from "@/hooks/use-header-background";
import { useProfile } from "@/hooks/use-profile";
import { useProfileUpdate } from "@/hooks/use-profile-update";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

/** 마이페이지 - 편입생 여부 수정 */
export default function MyPersonalTransferPage() {
  useHeaderBackground("white");
  const { t } = useTranslation();
  const { profile } = useProfile();
  const { isSubmitting, submitError, update } = useProfileUpdate();

  const [localIsTransfer, setLocalIsTransfer] = useState<boolean | null>(null);
  const isTransfer = localIsTransfer ?? (profile?.isTransfer ?? false);

  const canSubmit = profile != null;
  const isDirty = useMemo(
    () => localIsTransfer !== null && localIsTransfer !== (profile?.isTransfer ?? false),
    [localIsTransfer, profile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    await update(profile, { isTransfer });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <form
        id="personal-transfer-form"
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-4 pb-4"
        style={{ paddingBottom: "calc(112px + var(--safe-area-inset-bottom, 0px))" }}
      >
        <h1 className="text-ds-title-24-sb leading-ds-title-24-sb font-semibold text-ds-primary">
          {t("my.personal.transferPage.title")}
        </h1>

        <div className="mt-2 flex flex-col gap-2">
          <span className="text-ds-caption-14-m leading-ds-caption-14-m font-medium text-ds-tertiary">
            {t("my.personal.transferPage.label")}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLocalIsTransfer(false)}
              className={cn(
                "flex-1 rounded-md border-2 py-3 text-ds-body-16-r leading-ds-body-16-r",
                !isTransfer
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent bg-(--ds-gray-5) text-ds-tertiary"
              )}
            >
              {t("my.personal.transferPage.no")}
            </button>
            <button
              type="button"
              onClick={() => setLocalIsTransfer(true)}
              className={cn(
                "flex-1 rounded-md border-2 py-3 text-ds-body-16-r leading-ds-body-16-r",
                isTransfer
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent bg-(--ds-gray-5) text-ds-tertiary"
              )}
            >
              {t("my.personal.transferPage.yes")}
            </button>
          </div>
          {submitError && (
            <p className="text-ds-caption-14-r leading-ds-caption-14-r text-destructive">
              {submitError}
            </p>
          )}
        </div>
      </form>

      <div
        className="fixed left-0 right-0 z-10 bg-white pt-4 pb-4"
        style={{
          bottom: "calc(32px + var(--safe-area-inset-bottom, 0px))",
          maxWidth: "var(--app-max-width)",
          margin: "0 auto",
        }}
      >
        <div className="px-4">
          <Button
            type="submit"
            form="personal-transfer-form"
            variant="primary"
            size="lg"
            className={
              "h-auto w-full rounded-md py-3 text-ds-body-16-sb leading-ds-body-16-sb" +
              (canSubmit && !isSubmitting && isDirty
                ? " text-white"
                : " bg-(--ds-bg-disabled) text-ds-disabled hover:bg-(--ds-bg-disabled) active:bg-(--ds-bg-disabled)")
            }
            disabled={!canSubmit || isSubmitting || !isDirty}
          >
            {isSubmitting ? t("common.loading") : t("my.personal.transferPage.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
