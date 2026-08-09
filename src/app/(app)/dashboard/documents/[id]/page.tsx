import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PageShell } from "@/components/dashboard/page-header";
import {
  DeleteDocumentButton,
  FavoriteButton,
} from "@/components/documents/document-actions";
import { DocumentEditor } from "@/components/documents/document-editor";
import { PLANS } from "@/config/plans";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getPlanFor } from "@/lib/usage";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "تحرير مستند" };

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const document = await db.document.findFirst({
    // Scoping by ownerId here is the authorization check.
    where: { id, ownerId: user.id },
    select: {
      id: true,
      title: true,
      content: true,
      favorite: true,
      updatedAt: true,
      projectId: true,
    },
  });

  if (!document) notFound();

  const [projects, plan] = await Promise.all([
    db.project.findMany({
      where: { ownerId: user.id, archived: false },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true },
      take: 50,
    }),
    getPlanFor(user.id),
  ]);

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/documents"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          كل المستندات
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>

        <div className="flex items-center gap-1">
          <span className="me-2 text-xs text-slate-500">
            آخر تحديث {formatRelative(document.updatedAt)}
          </span>
          <FavoriteButton documentId={document.id} favorite={document.favorite} />
          <DeleteDocumentButton documentId={document.id} />
        </div>
      </div>

      <DocumentEditor
        document={{
          id: document.id,
          title: document.title,
          content: document.content,
          projectId: document.projectId,
        }}
        projects={projects}
        canExport={PLANS[plan].limits.export}
      />
    </PageShell>
  );
}
