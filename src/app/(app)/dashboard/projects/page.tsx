import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Folder, Sparkles } from "lucide-react";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { NewProjectButton } from "@/components/projects/project-dialogs";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatNumber, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "المشاريع" };

export default async function ProjectsPage() {
  const user = await requireUser();

  const projects = await db.project.findMany({
    where: { ownerId: user.id, archived: false },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      updatedAt: true,
      _count: { select: { documents: true, generations: true } },
    },
  });

  return (
    <PageShell>
      <PageHeader
        title="المشاريع"
        description="اجمع كل ما يخص عميلًا أو حملة في مساحة واحدة."
        actions={<NewProjectButton />}
      />

      <div className="mt-8">
        {projects.length === 0 ? (
          <EmptyState
            icon={<Folder className="h-5 w-5" />}
            title="لا توجد مشاريع بعد"
            description="مثال: مشروع باسم «مطعم عبدالله» يجمع عروض الأسعار والمنشورات والإعلانات وردود العملاء الخاصة به."
            action={<NewProjectButton />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="flex h-full flex-col p-5 transition-colors hover:border-brand-500/40">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-mint-500/20 text-brand-300 ring-1 ring-inset ring-white/10">
                    <Folder className="h-[18px] w-[18px]" aria-hidden />
                  </div>

                  <h2 className="truncate text-sm font-semibold text-slate-100">
                    {project.name}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-6 text-slate-400">
                    {project.description || "بدون وصف"}
                  </p>

                  <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" aria-hidden />
                      {formatNumber(project._count.documents)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      {formatNumber(project._count.generations)}
                    </span>
                    <span className="ms-auto">{formatRelative(project.updatedAt)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
