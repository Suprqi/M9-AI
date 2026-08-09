"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <AlertDialog.Content
          dir="rtl"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line-strong bg-ink-850 p-6 shadow-2xl"
        >
          <AlertDialog.Title className="text-base font-semibold text-slate-50">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-7 text-slate-400">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-start gap-2">
            <Button
              variant="danger"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  await onConfirm();
                  setOpen(false);
                })
              }
            >
              {confirmLabel}
            </Button>
            <AlertDialog.Cancel asChild>
              <Button variant="ghost" disabled={pending}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
