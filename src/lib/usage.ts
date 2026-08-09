import "server-only";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { PLANS, type PlanKey } from "@/config/plans";

export type UsageMetric = "generations" | "chatMessages";

export function currentPeriod(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getPlanFor(userId: string): Promise<PlanKey> {
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });
  if (!sub || sub.status !== "ACTIVE") return "FREE";
  return sub.plan;
}

export interface UsageSnapshot {
  plan: PlanKey;
  period: string;
  generations: { used: number; limit: number };
  chatMessages: { used: number; limit: number };
  tokensUsed: number;
}

export async function getUsageSnapshot(userId: string): Promise<UsageSnapshot> {
  const [plan, record] = await Promise.all([
    getPlanFor(userId),
    db.usage.findUnique({ where: { userId_period: { userId, period: currentPeriod() } } }),
  ]);

  const limits = PLANS[plan].limits;
  return {
    plan,
    period: currentPeriod(),
    generations: { used: record?.generations ?? 0, limit: limits.generationsPerMonth },
    chatMessages: { used: record?.chatMessages ?? 0, limit: limits.chatMessagesPerMonth },
    tokensUsed: record?.tokensUsed ?? 0,
  };
}

/**
 * Server-side quota gate. Must be called before any billable AI work — the
 * client is never trusted to enforce limits.
 */
export async function assertWithinQuota(userId: string, metric: UsageMetric): Promise<void> {
  const snapshot = await getUsageSnapshot(userId);
  const bucket = metric === "generations" ? snapshot.generations : snapshot.chatMessages;

  if (bucket.used >= bucket.limit) {
    throw new AppError(
      "QUOTA_EXCEEDED",
      `لقد استهلكت حد خطة "${PLANS[snapshot.plan].name}" لهذا الشهر (${bucket.limit}). قم بالترقية للمتابعة.`
    );
  }
}

export async function recordUsage(
  userId: string,
  metric: UsageMetric,
  tokens = 0
): Promise<void> {
  const period = currentPeriod();
  const increment = metric === "generations" ? { generations: 1 } : { chatMessages: 1 };

  await db.usage.upsert({
    where: { userId_period: { userId, period } },
    create: { userId, period, ...increment, tokensUsed: tokens },
    update: {
      ...(metric === "generations"
        ? { generations: { increment: 1 } }
        : { chatMessages: { increment: 1 } }),
      tokensUsed: { increment: tokens },
    },
  });
}

export async function assertPlanFeature(
  userId: string,
  feature: "export" | "allTools"
): Promise<void> {
  const plan = await getPlanFor(userId);
  if (!PLANS[plan].limits[feature]) {
    throw new AppError(
      "QUOTA_EXCEEDED",
      feature === "export"
        ? "تصدير المستندات متاح في خطة احترافي وما فوق."
        : "هذه الأداة متاحة في خطة احترافي وما فوق."
    );
  }
}
