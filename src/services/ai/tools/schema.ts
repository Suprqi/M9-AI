import { z } from "zod";

import { getTool, type ToolDefinition } from "./definitions";

export type ToolInput = Record<string, string>;

/**
 * Builds a zod schema from a tool's field definitions so validation rules can
 * never drift from the rendered form. Used on both sides; the server result is
 * the authoritative one.
 */
export function buildToolSchema(tool: ToolDefinition) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of tool.fields) {
    let rule = z.string().trim().max(field.maxLength ?? 2000, {
      message: `الحد الأقصى ${field.maxLength ?? 2000} حرف.`,
    });

    if (field.type === "select" && field.options?.length) {
      const allowed = field.options.map((o) => o.value);
      shape[field.name] = field.required
        ? z.string().refine((v) => allowed.includes(v), { message: "اختيار غير صالح." })
        : z
            .string()
            .optional()
            .default("")
            .refine((v) => !v || allowed.includes(v), { message: "اختيار غير صالح." });
      continue;
    }

    if (field.required) {
      rule = rule.min(2, { message: "هذا الحقل مطلوب." });
      shape[field.name] = rule;
    } else {
      shape[field.name] = rule.optional().default("");
    }
  }

  return z.object(shape).strict();
}

export function validateToolInput(
  toolKey: string,
  raw: unknown
): { ok: true; data: ToolInput } | { ok: false; errors: Record<string, string> } {
  const tool = getTool(toolKey);
  if (!tool) return { ok: false, errors: { _form: "الأداة غير موجودة." } };

  const result = buildToolSchema(tool).safeParse(raw);
  if (result.success) return { ok: true, data: result.data as ToolInput };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
