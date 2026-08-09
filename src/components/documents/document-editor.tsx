"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Download, Eye, Pencil, Printer, Save } from "lucide-react";

import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { updateDocumentAction } from "@/server/actions/documents";
import { IDLE_STATE } from "@/server/actions/types";

export interface EditorDocument {
  id: string;
  title: string;
  content: string;
  projectId: string | null;
}

export function DocumentEditor({
  document: doc,
  projects,
  canExport,
}: {
  document: EditorDocument;
  projects: { id: string; name: string }[];
  canExport: boolean;
}) {
  const boundAction = updateDocumentAction.bind(null, doc.id);
  const [state, formAction, pending] = useActionState(boundAction, IDLE_STATE);

  const [content, setContent] = useState(doc.content);
  const [mode, setMode] = useState<"edit" | "preview">(doc.content ? "preview" : "edit");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (!state.ok && state.message) toast.error(state.message);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("تم نسخ المحتوى.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("تعذر النسخ. حدّد النص وانسخه يدويًا.");
    }
  }

  return (
    <form action={formAction}>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <Input
            name="title"
            defaultValue={doc.title}
            required
            maxLength={160}
            aria-label="عنوان المستند"
            className="h-10 min-w-0 flex-1 border-transparent bg-transparent text-base font-semibold focus:border-line-strong"
          />

          <div className="flex items-center gap-1 rounded-xl border border-line p-1">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                mode === "edit"
                  ? "bg-white/[0.08] text-slate-100"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              تحرير
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                mode === "preview"
                  ? "bg-white/[0.08] text-slate-100"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              معاينة
            </button>
          </div>
        </div>

        <div className="border-b border-line px-4 py-3">
          <label
            htmlFor="projectId"
            className="me-3 text-xs text-slate-500"
          >
            المشروع
          </label>
          <Select
            id="projectId"
            name="projectId"
            defaultValue={doc.projectId ?? ""}
            className="h-9 w-auto min-w-44 text-xs"
          >
            <option value="">بدون مشروع</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="p-4">
          {mode === "edit" ? (
            <Textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب هنا… يدعم المحرر تنسيق Markdown: # للعناوين، - للقوائم، **للتغميق**."
              className="min-h-[480px] border-transparent bg-transparent text-sm leading-8 focus:border-line-strong"
            />
          ) : (
            <>
              <input type="hidden" name="content" value={content} />
              {content.trim() ? (
                <Markdown content={content} className="min-h-[480px] text-sm text-slate-300" />
              ) : (
                <p className="flex min-h-[480px] items-center justify-center text-sm text-slate-600">
                  المستند فارغ — انتقل إلى وضع التحرير للبدء.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line p-4">
          <Button type="submit" loading={pending}>
            <Save className="h-4 w-4" />
            حفظ
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={copy}>
            {copied ? <Check className="h-4 w-4 text-mint-400" /> : <Copy className="h-4 w-4" />}
            نسخ
          </Button>

          {canExport ? (
            <>
              <Button asChild variant="secondary" size="sm">
                <a href={`/api/documents/${doc.id}/export`} download>
                  <Download className="h-4 w-4" />
                  تصدير Word
                </a>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <a href={`/dashboard/documents/${doc.id}/print`} target="_blank" rel="noreferrer">
                  <Printer className="h-4 w-4" />
                  طباعة / PDF
                </a>
              </Button>
            </>
          ) : (
            <span className="text-xs text-slate-500">
              التصدير متاح في خطة احترافي وما فوق.
            </span>
          )}
        </div>
      </Card>
    </form>
  );
}
