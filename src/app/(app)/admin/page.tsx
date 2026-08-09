import type { Metadata } from "next";
import {
  AlertTriangle,
  Building2,
  CreditCard,
  Sparkles,
  Users,
} from "lucide-react";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { ToolIcon } from "@/components/tool-icon";
import { Card } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { PLANS, PLAN_ORDER } from "@/config/plans";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { currentPeriod } from "@/lib/usage";
import { formatNumber, formatRelative } from "@/lib/utils";
import { getTool } from "@/services/ai/tools/definitions";

export const metadata: Metadata = { title: "لوحة الإدارة", robots: { index: false } };

export default async function AdminPage() {
  await requireAdmin();

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [
    userCount,
    companyCount,
    generationCount,
    failedCount,
    dailyRaw,
    toolUsage,
    planCounts,
    recentErrors,
    periodUsage,
  ] = await Promise.all([
    db.user.count(),
    db.company.count(),
    db.generation.count(),
    db.generation.count({ where: { status: "FAILED" } }),
    db.generation.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    db.generation.groupBy({
      by: ["toolKey"],
      _count: { toolKey: true },
      orderBy: { _count: { toolKey: "desc" } },
      take: 6,
    }),
    db.subscription.groupBy({
      by: ["plan"],
      _count: { plan: true },
    }),
    db.generation.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        toolKey: true,
        errorCode: true,
        provider: true,
        createdAt: true,
      },
    }),
    db.usage.aggregate({
      where: { period: currentPeriod() },
      _sum: { generations: true, chatMessages: true, tokensUsed: true },
    }),
  ]);

  // Bucket the last 7 days in JS — avoids a raw SQL date_trunc for a small set.
  const daily = buildDailySeries(dailyRaw.map((row) => row.createdAt));
  const maxDaily = Math.max(1, ...daily.map((day) => day.count));
  const planMap = new Map(planCounts.map((row) => [row.plan, row._count.plan]));

  return (
    <PageShell>
      <PageHeader
        title="لوحة الإدارة"
        description="نظرة عامة على المستخدمين والاستخدام وحالة النظام."
        actions={<Badge variant="brand">صلاحية إدارية</Badge>}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="المستخدمون"
          value={formatNumber(userCount)}
        />
        <MetricCard
          icon={<Building2 className="h-4 w-4" />}
          label="المنشآت"
          value={formatNumber(companyCount)}
        />
        <MetricCard
          icon={<Sparkles className="h-4 w-4" />}
          label="عمليات الذكاء الاصطناعي"
          value={formatNumber(generationCount)}
        />
        <MetricCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="عمليات فاشلة"
          value={formatNumber(failedCount)}
          tone={failedCount > 0 ? "warn" : "default"}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-100">
            الاستخدام اليومي — آخر ٧ أيام
          </h2>

          <div className="mt-6 flex h-44 items-end gap-2">
            {daily.map((day) => (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-brand-600/60 to-mint-400/80"
                    style={{ height: `${Math.max(4, (day.count / maxDaily) * 100)}%` }}
                    title={`${day.count}`}
                  />
                </div>
                <span className="tabular text-[10px] text-slate-500">{day.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-4">
            <MiniStat
              label="توليدات هذا الشهر"
              value={formatNumber(periodUsage._sum.generations ?? 0)}
            />
            <MiniStat
              label="رسائل محادثة"
              value={formatNumber(periodUsage._sum.chatMessages ?? 0)}
            />
            <MiniStat
              label="توكنات مستهلكة"
              value={formatNumber(periodUsage._sum.tokensUsed ?? 0)}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-100">أكثر الأدوات استخدامًا</h2>

          {toolUsage.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">لا توجد بيانات بعد.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {toolUsage.map((row) => {
                const tool = getTool(row.toolKey);
                const share = Math.round((row._count.toolKey / (generationCount || 1)) * 100);
                return (
                  <li key={row.toolKey}>
                    <div className="mb-1.5 flex items-center gap-2 text-sm">
                      {tool ? (
                        <ToolIcon name={tool.icon} className="h-4 w-4 text-slate-500" />
                      ) : null}
                      <span className="text-slate-300">{tool?.name ?? row.toolKey}</span>
                      <span className="tabular ms-auto text-xs text-slate-500">
                        {formatNumber(row._count.toolKey)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-mint-400 to-brand-500"
                        style={{ width: `${Math.max(3, share)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <CreditCard className="h-4 w-4 text-slate-500" aria-hidden />
            الاشتراكات
          </h2>

          <div className="space-y-3">
            {PLAN_ORDER.map((key) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{PLANS[key].name}</span>
                <span className="tabular font-medium text-slate-100">
                  {formatNumber(planMap.get(key) ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <AlertTriangle className="h-4 w-4 text-slate-500" aria-hidden />
            آخر الأخطاء
          </h2>

          {recentErrors.length === 0 ? (
            <EmptyState title="لا توجد أخطاء مسجّلة" description="النظام يعمل بسلاسة." />
          ) : (
            <ul className="space-y-2.5">
              {recentErrors.map((error) => (
                <li
                  key={error.id}
                  className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2.5 text-xs"
                >
                  <span className="font-medium text-slate-300">
                    {getTool(error.toolKey)?.name ?? error.toolKey}
                  </span>
                  <Badge variant="danger">{error.errorCode ?? "UNKNOWN"}</Badge>
                  <span className="text-slate-600">{error.provider}</span>
                  <span className="ms-auto text-slate-600">
                    {formatRelative(error.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PageShell>
  );
}

function buildDailySeries(dates: Date[]) {
  const buckets = new Map<string, number>();
  const labels: { key: string; label: string }[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date();
    day.setDate(day.getDate() - offset);
    const key = day.toISOString().slice(0, 10);
    buckets.set(key, 0);
    labels.push({ key, label: String(day.getDate()) });
  }

  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return labels.map(({ key, label }) => ({ label, count: buckets.get(key) ?? 0 }));
}

function MetricCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "warn";
}) {
  return (
    <Card className="p-5">
      <div
        className={
          tone === "warn"
            ? "mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300"
            : "mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400"
        }
      >
        {icon}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="tabular mt-1 text-2xl font-bold text-slate-50">{value}</p>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="tabular mt-1 text-base font-semibold text-slate-100">{value}</p>
    </div>
  );
}
