"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { toPublicError } from "@/lib/errors";
import { RATE_LIMITS, checkRateLimit } from "@/lib/rate-limit";

import { failure, success, type ActionState } from "./types";

function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key]) result[key] = issue.message;
  }
  return result;
}

const profileSchema = z.object({
  name: z.string().trim().min(2, { message: "أدخل اسمك الكامل." }).max(80),
});

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await checkRateLimit(`settings:${user.id}`, RATE_LIMITS.write, "write");

    const parsed = profileSchema.safeParse({ name: formData.get("name") });
    if (!parsed.success) {
      return failure("تحقق من الحقول.", fieldErrors(parsed.error));
    }

    await db.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    return success("تم تحديث الملف الشخصي.");
  } catch (error) {
    const safe = toPublicError(error, "updateProfileAction");
    return failure(safe.message, undefined, safe.requestId);
  }
}

const companySchema = z.object({
  name: z.string().trim().min(2, { message: "أدخل اسم المنشأة." }).max(120),
  industry: z.string().trim().max(120).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
  tone: z.string().trim().max(120).optional().default(""),
  website: z.string().trim().max(200).optional().default(""),
});

export async function updateCompanyAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await checkRateLimit(`settings:${user.id}`, RATE_LIMITS.write, "write");

    const parsed = companySchema.safeParse({
      name: formData.get("name"),
      industry: formData.get("industry") ?? "",
      description: formData.get("description") ?? "",
      tone: formData.get("tone") ?? "",
      website: formData.get("website") ?? "",
    });

    if (!parsed.success) {
      return failure("تحقق من الحقول.", fieldErrors(parsed.error));
    }

    const data = {
      name: parsed.data.name,
      industry: parsed.data.industry || null,
      description: parsed.data.description || null,
      tone: parsed.data.tone || null,
      website: parsed.data.website || null,
    };

    if (user.companyId) {
      await db.company.update({ where: { id: user.companyId }, data });
    } else {
      const company = await db.company.create({ data, select: { id: true } });
      await db.user.update({
        where: { id: user.id },
        data: { companyId: company.id },
      });
    }

    revalidatePath("/dashboard/settings");
    return success("تم تحديث بيانات المنشأة.");
  } catch (error) {
    const safe = toPublicError(error, "updateCompanyAction");
    return failure(safe.message, undefined, safe.requestId);
  }
}

const preferencesSchema = z.object({
  writingStyle: z.string().trim().max(60),
  language: z.enum(["ar", "en"]),
  responseTone: z.string().trim().max(60),
  customContext: z.string().trim().max(1000).optional().default(""),
});

export async function updatePreferencesAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requireUser();
    await checkRateLimit(`settings:${user.id}`, RATE_LIMITS.write, "write");

    const parsed = preferencesSchema.safeParse({
      writingStyle: formData.get("writingStyle"),
      language: formData.get("language"),
      responseTone: formData.get("responseTone"),
      customContext: formData.get("customContext") ?? "",
    });

    if (!parsed.success) {
      return failure("تحقق من الحقول.", fieldErrors(parsed.error));
    }

    const data = {
      writingStyle: parsed.data.writingStyle,
      language: parsed.data.language,
      responseTone: parsed.data.responseTone,
      customContext: parsed.data.customContext || null,
    };

    await db.aIPreference.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    revalidatePath("/dashboard/settings");
    return success("تم تحديث تفضيلات الكتابة.");
  } catch (error) {
    const safe = toPublicError(error, "updatePreferencesAction");
    return failure(safe.message, undefined, safe.requestId);
  }
}
