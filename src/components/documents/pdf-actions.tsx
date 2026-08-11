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
 * reversed letters. Both paths here render what the browser already laid out:
 *
 *  - "طباعة" → native print dialog. Vector output, selectable text.
 *  - "تنزيل" → snapshot the page and slice it into A4 pages.
 */

const A4_RATIO = 297 / 210; // height / width

/**
 * Finds a row of near-white pixels to cut on, searching upward from the ideal
 * page boundary. Without this the slice lands mid-line and cuts glyphs in half.
 * Returns the ideal boundary when the page has no blank row to break on.
 */
function findBreakPoint(
  ctx: CanvasRenderingContext2D,
  width: number,
  idealEnd: number,
  minEnd: number
): number {
  const step = Math.max(1, Math.floor(width / 120)); // sample ~120 columns

  for (let y = idealEnd; y > minEnd; y -= 1) {
    const row = ctx.getImageData(0, y, width, 1).data;
    let blank = true;

    for (let x = 0; x < width; x += step) {
      const i = x * 4;
      // Anything clearly darker than paper counts as content.
      if (row[i]! < 245 || row[i + 1]! < 245 || row[i + 2]! < 245) {
        blank = false;
        break;
      }
    }

    if (blank) return y;
  }

  return idealEnd;
}

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
      // Loaded on demand — together these are ~400KB.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no canvas context");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidthMm = pdf.internal.pageSize.getWidth();
      const pageHeightMm = pdf.internal.pageSize.getHeight();

      // How much of the capture fits on one page, in capture pixels.
      const pagePx = Math.floor(canvas.width * A4_RATIO);
      const slice = document.createElement("canvas");
      const sliceCtx = slice.getContext("2d");
      if (!sliceCtx) throw new Error("no slice context");

      let y = 0;
      let first = true;

      while (y < canvas.height) {
        const idealEnd = Math.min(y + pagePx, canvas.height);
        // Only hunt for whitespace when there is a following page.
        const end =
          idealEnd >= canvas.height
            ? idealEnd
            : findBreakPoint(ctx, canvas.width, idealEnd, y + Math.floor(pagePx * 0.7));

        const height = end - y;
        slice.width = canvas.width;
        slice.height = height;
        sliceCtx.fillStyle = "#ffffff";
        sliceCtx.fillRect(0, 0, slice.width, slice.height);
        sliceCtx.drawImage(canvas, 0, y, canvas.width, height, 0, 0, canvas.width, height);

        if (!first) pdf.addPage();
        first = false;

        pdf.addImage(
          slice.toDataURL("image/jpeg", 0.92),
          "JPEG",
          0,
          0,
          pageWidthMm,
          // Keep the slice's own aspect ratio so nothing is stretched.
          Math.min((height * pageWidthMm) / canvas.width, pageHeightMm)
        );

        y = end;
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
      {/* This toolbar sits on a light banner regardless of the app theme, so
          the button colours are pinned rather than inherited — the themed
          variant renders near-white text and disappears here. */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => window.print()}
        className="border-[#cbd5e1] bg-white text-[#0f172a] hover:bg-[#e2e8f0] hover:text-[#0f172a]"
      >
        <Printer className="h-4 w-4" />
        طباعة
      </Button>
    </div>
  );
}
