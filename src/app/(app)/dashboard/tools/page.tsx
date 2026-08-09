import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { ToolIcon } from "@/components/tool-icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/misc";
import { PLANS } from "@/config/plans";
import { requireUser } from "@/lib/auth/session";
import { getPlanFor } from "@/lib/usage";
import { TOOLS, TOOL_CATEGORY_LABELS } from "@/services/ai/tools/definitions";

export const metadata: Metadata = { title: "أدوات الذكاء الاصطناعي" };

export default async function ToolsPage() {
  const user = await requireUser();
  const plan = await getPlanFor(user.id);
  const allTools = PLANS[plan].limits.allTools;

  return (
    <PageShell>
      <PageHeader
        title="أدوات الذكاء الاصطناعي"
        description="اختر الأداة المناسبة لمهمتك. كل أداة مضبوطة لمخرج واحد محدد."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const locked = tool.proOnly && !allTools;
          return (
            <Link
              key={tool.key}
              href={locked ? "/dashboard/subscription" : `/dashboard/tools/${tool.key}`}
              className="group"
            >
              <Card className="flex h-full flex-col p-6 transition-colors duration-200 group-hover:border-brand-500/40">
                <div className="flex items-start justify-between">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-mint-500/20 text-brand-300 ring-1 ring-inset ring-white/10">
                    <ToolIcon name={tool.icon} className="h-5 w-5" />
                  </div>
                  {locked ? (
                    <Badge variant="warn">
                      <Lock className="h-3 w-3" />
                      احترافي
                    </Badge>
                  ) : null}
                </div>

                <h2 className="text-base font-semibold text-slate-50">{tool.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-7 text-slate-400">
                  {tool.longDescription}
                </p>
                <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                  {TOOL_CATEGORY_LABELS[tool.category]}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
