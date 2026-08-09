import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { ToolIcon } from "@/components/tool-icon";
import { ToolRunner } from "@/components/tools/tool-runner";
import { Badge } from "@/components/ui/misc";
import { PLANS } from "@/config/plans";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getPlanFor } from "@/lib/usage";
import { TOOL_CATEGORY_LABELS, getTool } from "@/services/ai/tools/definitions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  const tool = getTool(key);
  return { title: tool?.name ?? "أداة" };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const tool = getTool(key);
  if (!tool) notFound();

  const user = await requireUser();
  const plan = await getPlanFor(user.id);
  const limits = PLANS[plan].limits;

  if (tool.proOnly && !limits.allTools) redirect("/dashboard/subscription");

  const projects = await db.project.findMany({
    where: { ownerId: user.id, archived: false },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true },
    take: 50,
  });

  return (
    <PageShell>
      <Link
        href="/dashboard/tools"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
      >
        كل الأدوات
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>

      <PageHeader
        title={tool.name}
        description={tool.longDescription}
        actions={
          <Badge variant="brand">{TOOL_CATEGORY_LABELS[tool.category]}</Badge>
        }
      />

      <div className="mt-8 flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-mint-500/20 text-brand-300">
          <ToolIcon name={tool.icon} className="h-4 w-4" />
        </div>
        <p className="text-xs text-slate-400">{tool.description}</p>
      </div>

      <div className="mt-6">
        <ToolRunner tool={tool} projects={projects} canExport={limits.export} />
      </div>
    </PageShell>
  );
}
