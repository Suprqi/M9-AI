import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, SectionHeading } from "@/components/ui/misc";
import { PLANS, PLAN_ORDER } from "@/config/plans";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-24 border-y border-line bg-ink-900/40 py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="الأسعار"
          title="ابدأ مجانًا، وارتقِ عندما يحتاج فريقك"
          description="جميع الخطط تشمل الواجهة العربية الكاملة. الأسعار شهرية ولا تشمل ضريبة القيمة المضافة."
        />

        <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
          {PLAN_ORDER.map((key) => {
            const plan = PLANS[key];
            return (
              <Card
                key={plan.key}
                className={cn(
                  "relative p-7",
                  plan.highlighted && "glow-brand border-brand-500/40"
                )}
              >
                {plan.highlighted ? (
                  <Badge
                    variant="brand"
                    className="absolute -top-3 start-7 border border-brand-500/30 bg-ink-850"
                  >
                    الأكثر اختيارًا
                  </Badge>
                ) : null}

                <h3 className="text-lg font-semibold text-slate-50">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  {plan.monthlyPrice === null ? (
                    <span className="text-2xl font-bold text-slate-50">تواصل معنا</span>
                  ) : (
                    <>
                      <span className="tabular text-4xl font-bold text-slate-50">
                        {plan.monthlyPrice}
                      </span>
                      <span className="text-sm text-slate-400">
                        {plan.currency} / شهريًا
                      </span>
                    </>
                  )}
                </div>

                <Button
                  asChild
                  className="mt-6 w-full"
                  variant={plan.highlighted ? "primary" : "secondary"}
                >
                  <Link href="/register">
                    {plan.key === "FREE" ? "ابدأ مجانًا" : `اختر ${plan.name}`}
                  </Link>
                </Button>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-mint-400"
                        aria-hidden
                      />
                      <span className="leading-6 text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          المدفوعات غير مفعّلة في هذه النسخة — يتم ضبط الخطة يدويًا من لوحة الإدارة.
        </p>
      </div>
    </section>
  );
}
