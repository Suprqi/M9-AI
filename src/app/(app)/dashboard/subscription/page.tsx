import type { Metadata } from "next";
import { Check } from "lucide-react";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/misc";
import { PLANS, PLAN_ORDER } from "@/config/plans";
import { requireUser } from "@/lib/auth/session";
import { getUsageSnapshot } from "@/lib/usage";
import { cn, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "الاشتراك" };

export default async function SubscriptionPage() {
  const user = await requireUser();
  const usage = await getUsageSnapshot(user.id);
  const currentPlan = PLANS[usage.plan];

  return (
    <PageShell>
      <PageHeader
        title="الاشتراك والاستخدام"
        description="تابع استهلاكك الشهري وقارن بين الخطط."
      />

      <Card className="mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">خطتك الحالية</p>
            <p className="mt-1 text-xl font-bold text-slate-50">{currentPlan.name}</p>
          </div>
          <Badge variant={usage.plan === "FREE" ? "default" : "mint"}>
            {usage.plan === "FREE" ? "مجاني" : "مفعّلة"}
          </Badge>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <UsageBar
            label="عمليات التوليد"
            used={usage.generations.used}
            limit={usage.generations.limit}
          />
          <UsageBar
            label="رسائل المحادثة"
            used={usage.chatMessages.used}
            limit={usage.chatMessages.limit}
          />
        </div>

        <p className="mt-5 text-xs text-slate-500">
          فترة الاستخدام الحالية: {usage.period} — تُصفّر الحدود تلقائيًا مع بداية كل
          شهر ميلادي.
        </p>
      </Card>

      <h2 className="mb-4 mt-10 text-lg font-semibold text-slate-100">مقارنة الخطط</h2>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLAN_ORDER.map((key) => {
          const plan = PLANS[key];
          const isCurrent = key === usage.plan;

          return (
            <Card
              key={key}
              className={cn("p-6", isCurrent && "border-mint-500/40 bg-mint-500/[0.04]")}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-50">{plan.name}</h3>
                {isCurrent ? <Badge variant="mint">خطتك</Badge> : null}
              </div>

              <p className="mt-1.5 text-xs text-slate-400">{plan.tagline}</p>

              <p className="mt-5">
                {plan.monthlyPrice === null ? (
                  <span className="text-xl font-bold text-slate-50">تواصل معنا</span>
                ) : (
                  <>
                    <span className="tabular text-3xl font-bold text-slate-50">
                      {plan.monthlyPrice}
                    </span>
                    <span className="ms-2 text-sm text-slate-400">
                      {plan.currency} / شهريًا
                    </span>
                  </>
                )}
              </p>

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-400" aria-hidden />
                    <span className="leading-6 text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <p className="mt-8 rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-xs leading-6 text-slate-400">
        بوابة الدفع غير مفعّلة في هذه النسخة. لترقية خطتك تواصل معنا وسيتم تغييرها من
        لوحة الإدارة — بنية الاشتراكات والحدود جاهزة بالكامل في قاعدة البيانات.
      </p>
    </PageShell>
  );
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = percent >= 80;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="tabular text-xs text-slate-500">
          {formatNumber(used)} / {formatNumber(limit)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            nearLimit
              ? "bg-gradient-to-l from-amber-400 to-red-500"
              : "bg-gradient-to-l from-mint-400 to-brand-500"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {nearLimit ? (
        <p className="mt-2 text-xs text-amber-300">
          اقتربت من حد خطتك — فكّر في الترقية.
        </p>
      ) : null}
    </div>
  );
}
