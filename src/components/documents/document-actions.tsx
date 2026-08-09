"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  createDocumentAction,
  deleteDocumentAction,
  toggleFavoriteAction,
} from "@/server/actions/documents";
import { cn } from "@/lib/utils";

export function NewDocumentButton({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await createDocumentAction(projectId ?? null);
          if (!result.ok || !result.documentId) {
            toast.error(result.message ?? "تعذر إنشاء المستند.");
            return;
          }
          router.push(`/dashboard/documents/${result.documentId}`);
        })
      }
    >
      <Plus className="h-4 w-4" />
      مستند جديد
    </Button>
  );
}

export function FavoriteButton({
  documentId,
  favorite,
}: {
  documentId: string;
  favorite: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-pressed={favorite}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleFavoriteAction(documentId);
          if (!result.ok) {
            toast.error(result.message ?? "تعذر تحديث المفضلة.");
            return;
          }
          toast.success(result.favorite ? "أُضيف للمفضلة." : "أُزيل من المفضلة.");
          router.refresh();
        })
      }
    >
      <Star className={cn("h-4 w-4", favorite && "fill-mint-400 text-mint-400")} />
      {favorite ? "في المفضلة" : "إضافة للمفضلة"}
    </Button>
  );
}

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();

  return (
    <ConfirmDialog
      title="حذف المستند"
      description="سيُحذف هذا المستند نهائيًا ولا يمكن التراجع عن العملية."
      confirmLabel="حذف نهائيًا"
      trigger={
        <Button variant="ghost" size="sm" className="text-red-300 hover:bg-red-500/10">
          <Trash2 className="h-4 w-4" />
          حذف
        </Button>
      }
      onConfirm={async () => {
        const result = await deleteDocumentAction(documentId);
        if (!result.ok) {
          toast.error(result.message ?? "تعذر حذف المستند.");
          return;
        }
        toast.success("تم حذف المستند.");
        router.push("/dashboard/documents");
        router.refresh();
      }}
    />
  );
}
