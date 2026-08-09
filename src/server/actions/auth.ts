"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { AppError, toPublicError } from "@/lib/errors";
import { RATE_LIMITS, checkRateLimit } from "@/lib/rate-limit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroyAllSessions,
  destroySession,
  requireUser,
} from "@/lib/auth/session";

import { failure, type ActionState } from "./types";

const emailRule = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: "أدخل بريدًا إلكترونيًا صحيحًا." });

const passwordRule = z
  .string()
  .min(8, { message: "كلمة المرور يجب أن تكون ٨ أحرف على الأقل." })
  .max(200, { message: "كلمة المرور طويلة جدًا." });

const registerSchema = z.object({
  name: z.string().trim().min(2, { message: "أدخل اسمك الكامل." }).max(80),
  email: emailRule,
  password: passwordRule,
  companyName: z.string().trim().max(120).optional().default(""),
});

const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, { message: "أدخل كلمة المرور." }),
});

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

async function requestMeta() {
  const store = await headers();
  return {
    userAgent: store.get("user-agent"),
    ip:
      store.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      store.get("x-real-ip") ??
      null,
  };
}

/** Rate-limit key: falls back to a shared bucket when no IP header is present. */
async function authRateKey(scope: string) {
  const meta = await requestMeta();
  return `${scope}:${meta.ip ?? "unknown"}`;
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await checkRateLimit(await authRateKey("register"), RATE_LIMITS.auth, "auth");

    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      companyName: formData.get("companyName") ?? "",
    });

    if (!parsed.success) {
      return failure("تحقق من البيانات المدخلة.", fieldErrorsFrom(parsed.error));
    }

    const { name, email, password, companyName } = parsed.data;

    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return failure("هذا البريد مسجّل مسبقًا.", {
        email: "هذا البريد مسجّل مسبقًا. جرّب تسجيل الدخول.",
      });
    }

    const passwordHash = await hashPassword(password);
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        company: companyName
          ? { create: { name: companyName } }
          : undefined,
        aiPreference: { create: {} },
        subscription: { create: { plan: "FREE", currentPeriodEnd: periodEnd } },
      },
      select: { id: true },
    });

    await createSession(user.id, await requestMeta());
  } catch (error) {
    const safe = toPublicError(error, "registerAction");
    return failure(safe.message, undefined, safe.requestId);
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await checkRateLimit(await authRateKey("login"), RATE_LIMITS.auth, "auth");

    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return failure("تحقق من البيانات المدخلة.", fieldErrorsFrom(parsed.error));
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, passwordHash: true },
    });

    // Identical response for unknown email and wrong password — no account enumeration.
    const valid = user
      ? await verifyPassword(parsed.data.password, user.passwordHash)
      : false;

    if (!user || !valid) {
      return failure("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    }

    await createSession(user.id, await requestMeta());
  } catch (error) {
    const safe = toPublicError(error, "loginAction");
    return failure(safe.message, undefined, safe.requestId);
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "أدخل كلمة المرور الحالية." }),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين.",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireUser();
    await checkRateLimit(`password:${session.id}`, RATE_LIMITS.auth, "auth");

    const parsed = changePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      return failure("تحقق من البيانات المدخلة.", fieldErrorsFrom(parsed.error));
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { passwordHash: true },
    });
    if (!user) throw new AppError("UNAUTHORIZED");

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return failure("كلمة المرور الحالية غير صحيحة.", {
        currentPassword: "كلمة المرور الحالية غير صحيحة.",
      });
    }

    await db.user.update({
      where: { id: session.id },
      data: { passwordHash: await hashPassword(parsed.data.newPassword) },
    });

    return { ok: true, message: "تم تغيير كلمة المرور بنجاح." };
  } catch (error) {
    const safe = toPublicError(error, "changePasswordAction");
    return failure(safe.message, undefined, safe.requestId);
  }
}

export async function logoutEverywhereAction(): Promise<void> {
  const session = await requireUser();
  await destroyAllSessions(session.id);
  redirect("/login");
}
