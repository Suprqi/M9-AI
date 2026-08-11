"use server";

import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppError, toPublicError } from "@/lib/errors";
import { RATE_LIMITS, checkRateLimit } from "@/lib/rate-limit";
import { PLANS } from "@/config/plans";
import { getPlanFor } from "@/lib/usage";
import {
  isAccent,
  isThemeMode,
  type Accent,
  type ThemeMode,
} from "@/config/themes";

export interface ThemeResult {
  ok: boolean;
  message?: string;
}

/**
 * Persists the user's theme. The plan gate is enforced here, not in the UI —
 * hiding the switcher from a FREE account is presentation, not authorization.
 */
export async function updateThemeAction(
  mode: ThemeMode,
  accent: Accent
): Promise<ThemeResult> {
  try {
    const user = await requireUser();
    await checkRateLimit(`theme:${user.id}`, RATE_LIMITS.write, "write");

    if (!isThemeMode(mode) || !isAccent(accent)) {
      throw new AppError("VALIDATION_ERROR", "خيار المظهر غير صالح.");
    }

    const plan = await getPlanFor(user.id);
    if (!PLANS[plan].limits.themes) {
      throw new AppError(
        "QUOTA_EXCEEDED",
        "تخصيص المظهر متاح في خطة احترافي وما فوق."
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { themeMode: mode, accent },
    });

    // Deliberately no revalidatePath: every route here is dynamically rendered,
    // so the next request already reads the new value. Busting the whole layout
    // cache only forced a slow re-render of a change the client had applied
    // instantly.
    return { ok: true, message: "تم تحديث المظهر." };
  } catch (error) {
    const safe = toPublicError(error, "updateThemeAction");
    return { ok: false, message: safe.message };
  }
}
