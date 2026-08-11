import { notFound } from "next/navigation";

import { Markdown } from "@/components/markdown";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "طباعة المستند", robots: { index: false } };

/**
 * Print-optimised view. Arabic PDF generation in the browser is unreliable with
 * JS PDF libraries (font shaping), so PDF export goes through the browser's own
 * print-to-PDF, which handles RTL correctly.
 */
export default async function PrintDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const document = await db.document.findFirst({
    where: { id, ownerId: user.id },
    select: {
      title: true,
      content: true,
      updatedAt: true,
      owner: { select: { company: { select: { name: true } } } },
    },
  });

  if (!document) notFound();

  return (
    <div className="mx-auto max-w-3xl bg-white px-10 py-12 text-black print:px-0 print:py-0">
      <div className="no-print mb-8 flex items-center justify-between rounded-xl bg-[#f1f5f9] px-4 py-3 text-sm text-slate-700">
        <span>استخدم أمر الطباعة في المتصفح ثم اختر «حفظ كـ PDF».</span>
      </div>

      <header className="mb-8 border-b border-slate-300 pb-5">
        <h1 className="text-2xl font-bold text-black">{document.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {document.owner.company?.name ? `${document.owner.company.name} — ` : ""}
          {formatDate(document.updatedAt)}
        </p>
      </header>

      <article className="prose-ar text-[15px] leading-9 text-black [&_blockquote]:text-slate-700 [&_code]:bg-[#f1f5f9] [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_strong]:text-black [&_td]:border-slate-300 [&_th]:border-slate-300 [&_th]:bg-[#f1f5f9]">
        <Markdown content={document.content} />
      </article>

      <footer className="mt-12 border-t border-slate-300 pt-4 text-xs text-slate-500">
        أُنشئ باستخدام M9 AI — المحتوى المولّد بالذكاء الاصطناعي لا يُعد استشارة
        قانونية أو مالية.
      </footer>
    </div>
  );
}
