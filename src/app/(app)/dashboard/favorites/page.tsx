import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatRelative, truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "المفضلة" };

export default async function FavoritesPage() {
  const user = await requireUser();

  const documents = await db.document.findMany({
    where: { ownerId: user.id, favorite: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, content: true, updatedAt: true },
  });

  return (
    <PageShell>
      <PageHeader
        title="المفضلة"
        description="المستندات التي تعود إليها كثيرًا، في مكان واحد."
      />

      <div className="mt-8">
        {documents.length === 0 ? (
          <EmptyState
            icon={<Star className="h-5 w-5" />}
            title="لا توجد مستندات مفضلة"
            description="افتح أي مستند واضغط «إضافة للمفضلة» ليظهر هنا."
            action={
              <Button asChild variant="secondary">
                <Link href="/dashboard/documents">تصفّح المستندات</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Link key={doc.id} href={`/dashboard/documents/${doc.id}`}>
                <Card className="flex items-center gap-4 p-4 transition-colors hover:border-brand-500/40">
                  <Star className="h-4 w-4 shrink-0 fill-mint-400 text-mint-400" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {doc.title}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {truncate(doc.content.replace(/[#*|>_-]/g, " "), 110)}
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
      </div>
    </PageShell>
  );
}
