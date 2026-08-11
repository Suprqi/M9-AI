import { notFound } from "next/navigation";

import { Markdown } from "@/components/markdown";
import { PdfActions } from "@/components/documents/pdf-actions";
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
      <div className="no-print mb-8 flex flex-col gap-3 rounded-xl bg-[#f1f5f9] px-4 py-3 text-sm text-[#334155] sm:flex-row sm:items-center sm:justify-between">
        <span className="leading-7">
          <strong className="font-semibold">طباعة</strong> تعطي نصًا قابلًا للتحديد
          والبحث — اختر «حفظ كـ PDF»، وأزِل علامة{" "}
          <strong className="font-semibold">«الرؤوس والتذييلات»</strong> لإخفاء رابط
          الصفحة والتاريخ اللذين يضيفهما المتصفح.
          <br />
          <strong className="font-semibold">تنزيل</strong> يحفظ الملف مباشرة بنقرة
          واحدة (النص صورة).
        </span>
        <PdfActions targetId="printable" title={document.title} />
      </div>

      <div id="printable" className="print-doc">
        <header className="mb-8 border-b border-[#cbd5e1] pb-5">
          <h1 className="text-2xl font-bold text-[#0b1220]">{document.title}</h1>
          <p className="mt-2 text-sm text-[#475569]">
            {document.owner.company?.name ? `${document.owner.company.name} — ` : ""}
            {formatDate(document.updatedAt)}
          </p>
        </header>

        <article className="prose-ar text-[15px] leading-9">
          <Markdown content={document.content} />
        </article>

        <footer className="mt-12 border-t border-[#cbd5e1] pt-4 text-xs text-[#64748b]">
          أُنشئ باستخدام M9 AI — المحتوى المولّد بالذكاء الاصطناعي لا يُعد استشارة
          قانونية أو مالية.
        </footer>
      </div>
    </div>
  );
}
