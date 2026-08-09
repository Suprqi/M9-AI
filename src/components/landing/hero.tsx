import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { TOOLS } from "@/services/ai/tools/definitions";
import { ToolIcon } from "@/components/tool-icon";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="bg-grid absolute inset-0 -z-10 opacity-60" aria-hidden />
      <div
        className="absolute -top-40 start-1/4 -z-10 h-[420px] w-[420px] rounded-full bg-brand-600/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="absolute -top-24 end-1/4 -z-10 h-[360px] w-[360px] rounded-full bg-mint-500/15 blur-[120px]"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Badge variant="brand" className="mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            مصمم للسوق السعودي — عربي بالكامل
          </Badge>

          <h1 className="text-4xl font-bold leading-[1.25] tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.2]">
            ذكاء اصطناعي <span className="text-gradient">يعمل معك</span>، لا عنك.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-9 text-slate-400">
            أنجز عروض الأسعار، المحتوى، الردود والمستندات التجارية في دقائق باستخدام
            M9 AI.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                ابدأ مجانًا
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#features">استكشف الأدوات</a>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-slate-400">
            {["بدون بطاقة ائتمانية", "جاهز خلال دقيقة", "بياناتك تبقى لك"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-mint-400" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}

function DashboardMockup() {
  const preview = TOOLS.slice(0, 4);

  return (
    <div className="relative" aria-hidden>
      <div className="glow-brand glass overflow-hidden rounded-2xl border border-line-strong">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-mint-400/70" />
          <span className="ms-auto text-[11px] text-slate-500">app.m9.ai/dashboard</span>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-0">
          {/* sidebar */}
          <div className="hidden w-40 shrink-0 border-e border-line p-3 sm:block">
            {["الرئيسية", "الأدوات", "المشاريع", "المستندات", "الحساب"].map((item, i) => (
              <div
                key={item}
                className={`mb-1 rounded-lg px-3 py-2 text-[12px] ${
                  i === 1 ? "bg-brand-500/15 text-brand-300" : "text-slate-500"
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* content */}
          <div className="p-5">
            <p className="text-[13px] text-slate-500">مرحبًا، عبدالله</p>
            <p className="mt-1 text-base font-semibold text-slate-100">
              ماذا تريد أن تنجز اليوم؟
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {preview.map((tool) => (
                <div
                  key={tool.key}
                  className="rounded-xl border border-line bg-white/[0.03] p-3"
                >
                  <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/25 to-mint-500/25 text-brand-300">
                    <ToolIcon name={tool.icon} className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[12px] font-medium text-slate-200">{tool.name}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-line bg-white/[0.03] p-3">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint-400" />
                <span className="text-[11px] text-slate-500">
                  جارٍ إنشاء عرض السعر…
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-11/12 rounded-full bg-white/10" />
                <div className="h-1.5 w-full rounded-full bg-white/10" />
                <div className="h-1.5 w-8/12 rounded-full bg-white/10" />
                <div className="h-1.5 w-9/12 rounded-full bg-gradient-to-l from-mint-500/40 to-brand-500/40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass absolute -bottom-5 start-4 hidden rounded-xl border border-line-strong px-4 py-3 sm:block">
        <p className="text-[11px] text-slate-500">متوسط الوقت الموفّر</p>
        <p className="tabular text-lg font-bold text-mint-400">‏٤٠ دقيقة / مستند</p>
      </div>
    </div>
  );
}
