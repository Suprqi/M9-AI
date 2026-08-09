"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppError, toPublicError } from "@/lib/errors";
import { RATE_LIMITS, checkRateLimit } from "@/lib/rate-limit";

import { failure, success, type ActionState } from "./types";

const documentSchema = z.object({
  title: z.string().trim().min(1, { message: "أدخل عنوانًا." }).max(160),
  content: z.string().max(120_000, { message: "المحتوى أطول من المسموح." }),
});

/** Every mutation re-checks ownership; ids from the client are never trusted. */
async function assertOwnedDocument(id: string, ownerId: string) {
  const found = await db.document.findFirst({
    where: { id, ownerId },
    select: { id: true },
  });
  if (!found) throw new AppError("NOT_FOUND", "المستند غير موجود.");
}

export async function createDocumentAction(
  projectId?: string | null
): Promise<{ ok: boolean; documentId?: string; message?: string }> {
  try {
    const user = await requireUser();
    await checkRateLimit(`doc:${user.id}`, RATE_LIMITS.write, "write");

    if (projectId) {
      const owns = await db.project.findFirst({
        where: { id: projectId, ownerId: user.id },
        select: { id: true },
      });
      if (!owns) throw new AppError("NOT_FOUND", "المشروع غير موجود.");
    }

    const document = await db.document.create({
      data: {
        title: "مستند جديد",
        content: "",
        ownerId: user.id,
        projectId: projectId ?? null,
      },
      select: { id: true },
    });

    revalidatePath("/dashboard/documents");
    return { ok: true, documentId: document.id };
  } catch (error) {
    const safe = toPublicError(error, "createDocumentAction");
    return { ok: false, message: safe.message };
  }
}

export async function updateDocumentAction(
  documentId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await checkRateLimit(`doc:${user.id}`, RATE_LIMITS.write, "write");
    await assertOwnedDocument(documentId, user.id);

    const parsed = documentSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      return failure("تحقق من الحقول.", fieldErrors);
    }

    const projectId = formData.get("projectId");
    const nextProjectId =
      typeof projectId === "string" && projectId !== "" ? projectId : null;

    if (nextProjectId) {
      const owns = await db.project.findFirst({
        where: { id: nextProjectId, ownerId: user.id },
        select: { id: true },
      });
      if (!owns) return failure("المشروع غير موجود.");
    }

    await db.document.update({
      where: { id: documentId },
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        projectId: nextProjectId,
      },
    });

    revalidatePath(`/dashboard/documents/${documentId}`);
    revalidatePath("/dashboard/documents");
    return success("تم حفظ المستند.");
  } catch (error) {
    const safe = toPublicError(error, "updateDocumentAction");
    return failure(safe.message, undefined, safe.requestId);
  }
}

export async function toggleFavoriteAction(
  documentId: string
): Promise<{ ok: boolean; favorite?: boolean; message?: string }> {
  try {
    const user = await requireUser();
    const document = await db.document.findFirst({
      where: { id: documentId, ownerId: user.id },
      select: { favorite: true },
    });
    if (!document) throw new AppError("NOT_FOUND", "المستند غير موجود.");

    const updated = await db.document.update({
      where: { id: documentId },
      data: { favorite: !document.favorite },
      select: { favorite: true },
    });

    revalidatePath("/dashboard/documents");
    revalidatePath("/dashboard/favorites");
    return { ok: true, favorite: updated.favorite };
  } catch (error) {
    const safe = toPublicError(error, "toggleFavoriteAction");
    return { ok: false, message: safe.message };
  }
}

export async function deleteDocumentAction(
  documentId: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const user = await requireUser();
    await assertOwnedDocument(documentId, user.id);

    await db.document.delete({ where: { id: documentId } });

    revalidatePath("/dashboard/documents");
    revalidatePath("/dashboard/favorites");
    return { ok: true };
  } catch (error) {
    const safe = toPublicError(error, "deleteDocumentAction");
    return { ok: false, message: safe.message };
  }
}
