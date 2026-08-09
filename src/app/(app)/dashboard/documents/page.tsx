import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { NewDocumentButton } from "@/components/documents/document-actions";
import { Card } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatRelative, truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "المستندات" };

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const user = await requireUser();
  const query = q?.trim() ?? "";

  const documents = await db.document.findMany({
    where: {
      ownerId: user.id,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { content: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      content: true,
      favorite: true,
      updatedAt: true,
      project: { select: { id: true, name: true } },
    },
  });

  return (
    <PageShell>
      <PageHeader
        title="المستندات"
        description="كل ما حفظته من مخرجات الأدوات، قابل للتعديل والتصدير."
        actions={<NewDocumentButton />}
      />

      <form className="mt-6" action="/dashboard/documents">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="ابحث في العناوين والمحتوى…"
          className="h-11 w-full max-w-md rounded-xl border border-line-strong bg-ink-900/60 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500"
        />
      </form>

      <div className="mt-6">
        {documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title={query ? "لا توجد نتائج" : "لا توجد مستندات بعد"}
            description={
              query
                ? "جرّب كلمات بحث أخرى."
                : "أنشئ مستندًا فارغًا، أو احفظ مخرجات إحدى الأدوات."
            }
            action={
              query ? (
                <Button asChild variant="secondary">
                  <Link href="/dashboard/documents">مسح البحث</Link>
                </Button>
              ) : (
                <NewDocumentButton />
              )
            }
          />
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Link key={doc.id} href={`/dashboard/documents/${doc.id}`}>
                <Card className="flex items-center gap-4 p-4 transition-colors hover:border-brand-500/40">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400">
                    <FileText className="h-4 w-4" aria-hidden />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {doc.title}
                      </p>
                      {doc.favorite ? <Badge variant="mint">مفضّل</Badge> : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {doc.content.trim()
                        ? truncate(doc.content.replace(/[#*|>_-]/g, " "), 110)
                        : "مستند فارغ"}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-end sm:block">
                    {doc.project ? (
                      <p className="text-xs text-brand-300">{doc.project.name}</p>
                    ) : null}
                    <p className="text-xs text-slate-500">
                      {formatRelative(doc.updatedAt)}
                    </p>
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
