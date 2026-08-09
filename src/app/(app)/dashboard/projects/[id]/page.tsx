import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileText, Sparkles } from "lucide-react";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { NewDocumentButton } from "@/components/documents/document-actions";
import {
  DeleteProjectButton,
  EditProjectButton,
} from "@/components/projects/project-dialogs";
import { ToolIcon } from "@/components/tool-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatRelative, truncate } from "@/lib/utils";
import { getTool } from "@/services/ai/tools/definitions";

export const metadata: Metadata = { title: "المشروع" };

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const project = await db.project.findFirst({
    where: { id, ownerId: user.id },
    select: {
      id: true,
      name: true,
      description: true,
      documents: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          content: true,
          toolKey: true,
          updatedAt: true,
        },
      },
      generations: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, toolKey: true, createdAt: true, status: true },
      },
    },
  });

  if (!project) notFound();

  return (
    <PageShell>
      <Link
        href="/dashboard/projects"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
      >
        كل المشاريع
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>

      <PageHeader
        title={project.name}
        description={project.description ?? "بدون وصف"}
        actions={
          <>
            <EditProjectButton
              projectId={project.id}
              name={project.name}
              description={project.description}
            />
            <DeleteProjectButton projectId={project.id} />
          </>
        }
      />

      <div className="mt-8 flex flex-wrap gap-2">
        <NewDocumentButton projectId={project.id} />
        <Button asChild variant="secondary">
          <Link href="/dashboard/tools">
            <Sparkles className="h-4 w-4" />
            إنشاء محتوى للمشروع
          </Link>
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">مستندات المشروع</h2>

        {project.documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="لا توجد مستندات في هذا المشروع"
            description="استخدم إحدى الأدوات واختر هذا المشروع عند الحفظ، أو أنشئ مستندًا فارغًا."
            action={<NewDocumentButton projectId={project.id} />}
          />
        ) : (
          <div className="space-y-2">
            {project.documents.map((doc) => {
              const tool = doc.toolKey ? getTool(doc.toolKey) : undefined;
              return (
                <Link key={doc.id} href={`/dashboard/documents/${doc.id}`}>
                  <Card className="flex items-center gap-4 p-4 transition-colors hover:border-brand-500/40">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400">
                      {tool ? (
                        <ToolIcon name={tool.icon} className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {doc.title}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {doc.content.trim()
                          ? truncate(doc.content.replace(/[#*|>_-]/g, " "), 100)
                          : "مستند فارغ"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">
                      {formatRelative(doc.updatedAt)}
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {project.generations.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">آخر العمليات</h2>
          <Card className="divide-y divide-[color:var(--color-line)]">
            {project.generations.map((generation) => {
              const tool = getTool(generation.toolKey);
              return (
                <div
                  key={generation.id}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  {tool ? (
                    <ToolIcon name={tool.icon} className="h-4 w-4 text-slate-500" />
                  ) : null}
                  <span className="text-slate-300">
                    {tool?.name ?? generation.toolKey}
                  </span>
                  <span
                    className={
                      generation.status === "SUCCESS"
                        ? "text-xs text-mint-400"
                        : "text-xs text-red-400"
                    }
                  >
                    {generation.status === "SUCCESS" ? "ناجحة" : "فاشلة"}
                  </span>
                  <span className="ms-auto text-xs text-slate-500">
                    {formatRelative(generation.createdAt)}
                  </span>
                </div>
              );
            })}
          </Card>
        </section>
      ) : null}
    </PageShell>
  );
}
