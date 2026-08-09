"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import {
  createProjectAction,
  deleteProjectAction,
  renameProjectAction,
} from "@/server/actions/projects";

function DialogShell({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          dir="rtl"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line-strong bg-ink-850 p-6 shadow-2xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-slate-50">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await createProjectAction(formData);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message ?? "تعذر إنشاء المشروع.");
        return;
      }
      setOpen(false);
      setErrors({});
      toast.success("تم إنشاء المشروع.");
      router.push(`/dashboard/projects/${result.projectId}`);
      router.refresh();
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        مشروع جديد
      </Button>

      <DialogShell open={open} onOpenChange={setOpen} title="مشروع جديد">
        <form action={submit} className="space-y-4">
          <div>
            <Label htmlFor="name" required>
              اسم المشروع
            </Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={120}
              placeholder="مثال: مطعم عبدالله"
              className="mt-1.5"
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <Label htmlFor="description">وصف مختصر</Label>
            <Textarea
              id="description"
              name="description"
              maxLength={500}
              placeholder="اختياري — ما الذي يجمع مستندات هذا المشروع؟"
              className="mt-1.5 min-h-20"
            />
            <FieldError message={errors.description} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={pending}>
              إنشاء
            </Button>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost">
                إلغاء
              </Button>
            </Dialog.Close>
          </div>
        </form>
      </DialogShell>
    </>
  );
}

export function EditProjectButton({
  projectId,
  name,
  description,
}: {
  projectId: string;
  name: string;
  description: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await renameProjectAction(projectId, formData);
      if (!result.ok) {
        toast.error(result.message ?? "تعذر تحديث المشروع.");
        return;
      }
      setOpen(false);
      toast.success("تم تحديث المشروع.");
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
        تعديل
      </Button>

      <DialogShell open={open} onOpenChange={setOpen} title="تعديل المشروع">
        <form action={submit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name" required>
              اسم المشروع
            </Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={name}
              required
              maxLength={120}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="edit-description">وصف مختصر</Label>
            <Textarea
              id="edit-description"
              name="description"
              defaultValue={description ?? ""}
              maxLength={500}
              className="mt-1.5 min-h-20"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={pending}>
              حفظ
            </Button>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost">
                إلغاء
              </Button>
            </Dialog.Close>
          </div>
        </form>
      </DialogShell>
    </>
  );
}

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();

  return (
    <ConfirmDialog
      title="حذف المشروع"
      description="سيُحذف المشروع نهائيًا. المستندات المرتبطة به لن تُحذف — ستبقى في «المستندات» بدون مشروع."
      confirmLabel="حذف المشروع"
      trigger={
        <Button variant="ghost" size="sm" className="text-red-300 hover:bg-red-500/10">
          <Trash2 className="h-4 w-4" />
          حذف
        </Button>
      }
      onConfirm={async () => {
        const result = await deleteProjectAction(projectId);
        if (!result.ok) {
          toast.error(result.message ?? "تعذر حذف المشروع.");
          return;
        }
        toast.success("تم حذف المشروع.");
        router.push("/dashboard/projects");
        router.refresh();
      }}
    />
  );
}
