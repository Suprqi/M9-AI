"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { toPublicError } from "@/lib/errors";
import { runTool } from "@/services/generation";

export interface GenerateResult {
  ok: boolean;
  output?: string;
  generationId?: string;
  message?: string;
  requestId?: string;
}

export async function generateAction(
  toolKey: string,
  input: Record<string, string>,
  projectId?: string | null
): Promise<GenerateResult> {
  let userId: string | undefined;
  try {
    const user = await requireUser();
    userId = user.id;

    const result = await runTool({
      userId: user.id,
      plan: user.plan,
      toolKey,
      rawInput: input,
      projectId: projectId ?? null,
    });

    return { ok: true, output: result.output, generationId: result.generationId };
  } catch (error) {
    const safe = toPublicError(error, `generateAction:${toolKey}`, userId);
    return { ok: false, message: safe.message, requestId: safe.requestId };
  }
}

export interface SaveResult {
  ok: boolean;
  documentId?: string;
  message?: string;
}

export async function saveGenerationAction(
  toolKey: string,
  title: string,
  content: string,
  projectId?: string | null
): Promise<SaveResult> {
  let userId: string | undefined;
  try {
    const user = await requireUser();
    userId = user.id;

    const cleanTitle = title.trim().slice(0, 160) || "مستند بدون عنوان";
    if (!content.trim()) {
      return { ok: false, message: "لا يوجد محتوى لحفظه." };
    }

    if (projectId) {
      const owns = await db.project.findFirst({
        where: { id: projectId, ownerId: user.id },
        select: { id: true },
      });
      if (!owns) return { ok: false, message: "المشروع غير موجود." };
    }

    const document = await db.document.create({
      data: {
        title: cleanTitle,
        content,
        toolKey,
        ownerId: user.id,
        projectId: projectId ?? null,
      },
      select: { id: true },
    });

    revalidatePath("/dashboard/documents");
    revalidatePath("/dashboard");

    return { ok: true, documentId: document.id };
  } catch (error) {
    const safe = toPublicError(error, "saveGenerationAction", userId);
    return { ok: false, message: safe.message };
  }
}
