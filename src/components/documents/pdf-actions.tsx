"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { slugifyFilename } from "@/lib/utils";

/**
 * PDF is produced by the browser, not by a JS PDF library.
 *
 * jsPDF/pdf-lib/pdfmake do not perform Arabic glyph shaping or bidi
 * reordering, so writing Arabic text through them yields disconnected,
 * reversed letters. Both paths here therefore rasterise or print what the
 * browser has already laid out correctly:
 *
 *  - "طباعة" → the native print dialog. Vector output, selectable text.
 *    Best quality; the user picks "Save as PDF".
 *  - "تنزيل" → snapshot the laid-out page and page it into a PDF file.
 *    One click, but the text is an image.
 */
export function PdfActions({
  targetId,
  title,
}: {
  targetId: string;
  title: string;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    const node = document.getElementById(targetId);
    if (!node) {
      toast.error("تعذر العثور على محتوى المستند.");
      return;
    }

    setBusy(true);
    const toastId = toast.loading("جارٍ تجهيز ملف PDF…");

    try {
      // Loaded on demand — these two libraries are large and would otherwise
      // ship on every page that imports this component.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Scale the capture to page width, then walk down it one page at a time.
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      const image = canvas.toDataURL("image/jpeg", 0.92);

      let remaining = imgHeight;
      let offset = 0;

      pdf.addImage(image, "JPEG", 0, 0, pageWidth, imgHeight);
      remaining -= pageHeight;

      while (remaining > 0) {
        offset -= pageHeight;
        pdf.addPage();
        pdf.addImage(image, "JPEG", 0, offset, pageWidth, imgHeight);
        remaining -= pageHeight;
      }

      pdf.save(`${slugifyFilename(title)}.pdf`);
      toast.success("تم تنزيل الملف.", { id: toastId });
    } catch {
      toast.error("تعذر إنشاء ملف PDF. جرّب زر الطباعة بدلًا منه.", { id: toastId });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={download} loading={busy}>
        <Download className="h-4 w-4" />
        تنزيل PDF
      </Button>
      <Button size="sm" variant="secondary" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        طباعة
      </Button>
    </div>
  );
}
