import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Folder, Sparkles, Zap } from "lucide-react";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { ToolIcon } from "@/components/tool-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { PLANS } from "@/config/plans";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getUsageSnapshot } from "@/lib/usage";
import { formatNumber, formatRelative, truncate } from "@/lib/utils";
import { isMockProvider } from "@/services/ai";
import { TOOLS } from "@/services/ai/tools/definitions";

export const metadata: Metadata = { title: "الرئيسية" };

export default async function DashboardHome() {
  const user = await requireUser();

  const [usage, counts, recentDocuments] = await Promise.all([
    getUsageSnapshot(user.id),
    Promise.all([
      db.project.count({ where: { ownerId: user.id, archived: false } }),
      db.document.count({ where: { ownerId: user.id } }),
      db.generation.count({ where: { userId: user.id, status: "SUCCESS" } }),
    ]),
    db.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, content: true, updatedAt: true },
    }),
  ]);

  const [projectCount, documentCount, generationCount] = counts;
  const firstName = user.name.split(" ")[0] ?? user.name;
  const remaining = Math.max(0, usage.generations.limit - usage.generations.used);
  const percent = Math.min(
    100,
    Math.round((usage.generations.used / usage.generations.limit) * 100)
  );

  return (
    <PageShell>
      {isMockProvider() ? (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <Zap className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="leading-6">
            المنصة تعمل حاليًا بالمزود التجريبي المدمج (بدون مفتاح API). المخرجات
            حقيقية البنية لكنها قوالب ثابتة — أضف{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">AI_API_KEY</code>{" "}
            في ملف البيئة لتفعيل المزود الحقيقي.
          </p>
        </div>
      ) : null}

      <PageHeader
        title={`مرحبًا، ${firstName}`}
        description="ماذا تريد أن تنجز اليوم؟"
        actions={
          <Button asChild>
            <Link href="/ai">
              افتح المحادثة
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {/* stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="عمليات هذا الشهر"
          value={`${formatNumber(usage.generations.used)} / ${formatNumber(usage.generations.limit)}`}
          hint={`متبقٍ ${formatNumber(remaining)} عملية`}
          progress={percent}
        />
        <StatCard label="إجمالي التوليدات" value={formatNumber(generationCount)} />
        <StatCard label="المشاريع" value={formatNumber(projectCount)} />
        <StatCard label="المستندات" value={formatNumber(documentCount)} />
      </div>

      {/* tools */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">أدوات جاهزة</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/tools">عرض الكل</Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const locked = tool.proOnly && !PLANS[usage.plan].limits.allTools;
            return (
              <Link
                key={tool.key}
                href={locked ? "/dashboard/subscription" : `/dashboard/tools/${tool.key}`}
                className="group"
              >
                <Card className="h-full p-5 transition-colors duration-200 group-hover:border-brand-500/40">
                  <div className="flex items-start justify-between">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-mint-500/20 text-brand-300 ring-1 ring-inset ring-white/10">
                      <ToolIcon name={tool.icon} className="h-[18px] w-[18px]" />
                    </div>
                    {locked ? <Badge variant="warn">احترافي</Badge> : null}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">{tool.name}</h3>
                  <p className="mt-1.5 text-xs leading-6 text-slate-400">
                    {tool.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* recent */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">آخر المستندات</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/documents">كل المستندات</Link>
          </Button>
        </div>

        {recentDocuments.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="لا توجد مستندات بعد"
            description="ابدأ بإحدى الأدوات وسيظهر أول مستند لك هنا."
            action={
              <Button asChild>
                <Link href="/dashboard/tools">
                  <Sparkles className="h-4 w-4" />
                  تصفّح الأدوات
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {recentDocuments.map((doc) => (
              <Link key={doc.id} href={`/dashboard/documents/${doc.id}`}>
                <Card className="flex items-center gap-4 p-4 transition-colors hover:border-brand-500/40">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400">
                    <FileText className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {doc.title}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {truncate(doc.content.replace(/[#*|>_-]/g, " "), 90)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">
                    {formatRelative(doc.updatedAt)}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {projectCount === 0 ? (
        <section className="mt-10">
          <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Folder className="mt-0.5 h-5 w-5 text-mint-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  نظّم عملك في مشاريع
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-400">
                  اجمع عروض الأسعار والمنشورات والردود الخاصة بكل عميل في مكان واحد.
                </p>
              </div>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/projects">إنشاء مشروع</Link>
            </Button>
          </Card>
        </section>
      ) : null}
    </PageShell>
  );
}

function StatCard({
  label,
  value,
  hint,
  progress,
}: {
  label: string;
  value: string;
  hint?: string;
  progress?: number;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="tabular mt-2 text-2xl font-bold text-slate-50">{value}</p>
      {typeof progress === "number" ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-gradient-to-l from-mint-400 to-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}
