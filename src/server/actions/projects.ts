"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppError, toPublicError } from "@/lib/errors";
import { RATE_LIMITS, checkRateLimit } from "@/lib/rate-limit";
import { PLANS } from "@/config/plans";
import { getPlanFor } from "@/lib/usage";

const projectSchema = z.object({
  name: z.string().trim().min(2, { message: "أدخل اسم المشروع." }).max(120),
  description: z.string().trim().max(500).optional().default(""),
});

export interface ProjectResult {
  ok: boolean;
  projectId?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function createProjectAction(formData: FormData): Promise<ProjectResult> {
  try {
    const user = await requireUser();
    await checkRateLimit(`project:${user.id}`, RATE_LIMITS.write, "write");

    const parsed = projectSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") ?? "",
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      return { ok: false, message: "تحقق من الحقول.", fieldErrors };
    }

    // Plan cap enforced server-side.
    const plan = await getPlanFor(user.id);
    const existing = await db.project.count({
      where: { ownerId: user.id, archived: false },
    });
    if (existing >= PLANS[plan].limits.projects) {
      return {
        ok: false,
        message: `خطة "${PLANS[plan].name}" تسمح بـ ${PLANS[plan].limits.projects} مشروع. قم بالترقية لإضافة المزيد.`,
      };
    }

    const project = await db.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        ownerId: user.id,
        companyId: user.companyId,
      },
      select: { id: true },
    });

    revalidatePath("/dashboard/projects");
    return { ok: true, projectId: project.id };
  } catch (error) {
    const safe = toPublicError(error, "createProjectAction");
    return { ok: false, message: safe.message };
  }
}

export async function renameProjectAction(
  projectId: string,
  formData: FormData
): Promise<ProjectResult> {
  try {
    const user = await requireUser();
    const owns = await db.project.findFirst({
      where: { id: projectId, ownerId: user.id },
      select: { id: true },
    });
    if (!owns) throw new AppError("NOT_FOUND", "المشروع غير موجود.");

    const parsed = projectSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description") ?? "",
    });
    if (!parsed.success) {
      return { ok: false, message: "تحقق من الحقول." };
    }

    await db.project.update({
      where: { id: projectId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
      },
    });

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true, projectId };
  } catch (error) {
    const safe = toPublicError(error, "renameProjectAction");
    return { ok: false, message: safe.message };
  }
}

export async function deleteProjectAction(
  projectId: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const user = await requireUser();
    const owns = await db.project.findFirst({
      where: { id: projectId, ownerId: user.id },
      select: { id: true },
    });
    if (!owns) throw new AppError("NOT_FOUND", "المشروع غير موجود.");

    // Documents survive the project — they are detached, not destroyed.
    await db.project.delete({ where: { id: projectId } });

    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard/documents");
    return { ok: true };
  } catch (error) {
    const safe = toPublicError(error, "deleteProjectAction");
    return { ok: false, message: safe.message };
  }
}
