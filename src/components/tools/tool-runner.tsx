"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";

import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import { generateAction, saveGenerationAction } from "@/server/actions/tools";
import type { ToolDefinition } from "@/services/ai/tools/definitions";

export interface ProjectOption {
  id: string;
  name: string;
}

export function ToolRunner({
  tool,
  projects,
  canExport,
}: {
  tool: ToolDefinition;
  projects: ProjectOption[];
  canExport: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      tool.fields.map((field) => [
        field.name,
        field.type === "select" ? (field.options?.[0]?.value ?? "") : "",
      ])
    )
  );
  const [projectId, setProjectId] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [saving, startSaving] = useTransition();

  function setValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const field of tool.fields) {
      const value = values[field.name]?.trim() ?? "";
      if (field.required && value.length < 2) {
        next[field.name] = "هذا الحقل مطلوب.";
      } else if (field.maxLength && value.length > field.maxLength) {
        next[field.name] = `الحد الأقصى ${field.maxLength} حرف.`;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function run() {
    setFormError(null);
    if (!validate()) {
      toast.error("أكمل الحقول المطلوبة أولًا.");
      return;
    }

    startTransition(async () => {
      const result = await generateAction(tool.key, values, projectId || null);
      if (!result.ok) {
        setFormError(result.message ?? "حدث خطأ أثناء إنشاء المحتوى. حاول مرة أخرى.");
        toast.error(result.message ?? "حدث خطأ أثناء إنشاء المحتوى.");
        return;
      }
      setOutput(result.output ?? "");
      setSavedId(null);
      toast.success("تم إنشاء المحتوى.");
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success("تم نسخ المحتوى.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("تعذر النسخ. حدّد النص وانسخه يدويًا.");
    }
  }

  function save() {
    startSaving(async () => {
      const title = buildTitle(tool, values);
      const result = await saveGenerationAction(tool.key, title, output, projectId || null);
      if (!result.ok || !result.documentId) {
        toast.error(result.message ?? "تعذر حفظ المستند.");
        return;
      }
      setSavedId(result.documentId);
      toast.success("تم الحفظ في المستندات.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr] lg:items-start">
      {/* form */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-slate-100">أدخل التفاصيل</h2>
        <p className="mt-1 text-xs leading-6 text-slate-500">
          كلما كانت التفاصيل أدق، كانت المخرجات أقرب لما تريد.
        </p>

        <div className="mt-6 space-y-4">
          {tool.fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name} required={field.required}>
                {field.label}
              </Label>

              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  className="mt-1.5"
                />
              ) : field.type === "select" ? (
                <Select
                  id={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  className="mt-1.5"
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  className="mt-1.5"
                />
              )}

              <FieldError message={errors[field.name]} />
            </div>
          ))}

          {projects.length > 0 ? (
            <div>
              <Label htmlFor="projectId">حفظ ضمن مشروع</Label>
              <Select
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1.5"
              >
                <option value="">بدون مشروع</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </div>

        {formError ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {formError}
          </p>
        ) : null}

        <Button onClick={run} loading={pending} className="mt-6 w-full">
          {pending ? (
            "جارٍ الإنشاء…"
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              إنشاء المحتوى
            </>
          )}
        </Button>
      </Card>

      {/* output */}
      <Card className="flex min-h-[420px] flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <h2 className="text-sm font-semibold text-slate-100">النتيجة</h2>

          {output && !pending ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={copy}>
                {copied ? (
                  <Check className="h-4 w-4 text-mint-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                نسخ
              </Button>
              <Button variant="ghost" size="sm" onClick={run}>
                <RefreshCw className="h-4 w-4" />
                إعادة التوليد
              </Button>
              <Button variant="secondary" size="sm" onClick={save} loading={saving}>
                <Save className="h-4 w-4" />
                {savedId ? "حفظ نسخة أخرى" : "حفظ"}
              </Button>
              {savedId && canExport ? (
                <Button asChild variant="secondary" size="sm">
                  <a href={`/api/documents/${savedId}/export`} download>
                    <Download className="h-4 w-4" />
                    تصدير Word
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {tool.disclaimer ? (
          <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs leading-6 text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {tool.disclaimer}
          </p>
        ) : null}

        <div className="mt-4 flex-1">
          {pending ? (
            <div className="space-y-3" aria-live="polite" aria-busy="true">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-9/12" />
              <Skeleton className="mt-6 h-5 w-1/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-10/12" />
              <Skeleton className="h-3 w-8/12" />
            </div>
          ) : output ? (
            <>
              <Markdown content={output} className="text-sm text-slate-300" />
              {savedId ? (
                <p className="mt-6 rounded-xl border border-mint-500/25 bg-mint-500/10 px-4 py-3 text-xs text-mint-200">
                  حُفظ المستند.{" "}
                  <a
                    href={`/dashboard/documents/${savedId}`}
                    className="underline underline-offset-4"
                  >
                    افتحه في المحرر
                  </a>
                </p>
              ) : null}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
              <Sparkles className="mb-3 h-6 w-6 text-slate-600" aria-hidden />
              <p className="text-sm text-slate-400">
                املأ الحقول واضغط «إنشاء المحتوى».
              </p>
              <p className="mt-1.5 max-w-xs text-xs leading-6 text-slate-600">
                ستظهر النتيجة هنا جاهزة للنسخ أو الحفظ أو التعديل.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/** Builds a readable document title from whichever identifying field exists. */
function buildTitle(tool: ToolDefinition, values: Record<string, string>): string {
  const candidates = [
    "clientName",
    "contractType",
    "topic",
    "subject",
    "product",
    "business",
  ];
  for (const key of candidates) {
    const value = values[key]?.trim();
    if (value) return `${tool.name} — ${value.slice(0, 60)}`;
  }
  return `${tool.name} — ${new Date().toLocaleDateString("ar-SA")}`;
}
