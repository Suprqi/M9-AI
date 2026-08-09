import "server-only";

import type { ToolDefinition } from "./definitions";

export interface PromptContext {
  companyName?: string | null;
  companyIndustry?: string | null;
  companyTone?: string | null;
  writingStyle?: string;
  responseTone?: string;
  customContext?: string | null;
}

const BASE_SYSTEM = `أنت مساعد أعمال عربي محترف يعمل ضمن منصة M9 AI، موجّه للشركات والمؤسسات الصغيرة والمتوسطة في المملكة العربية السعودية.

قواعد الكتابة:
- اكتب بالعربية الفصحى المهنية، بأسلوب طبيعي غير مترجم.
- استخدم المصطلحات التجارية السعودية المتعارف عليها (ريال، السجل التجاري، الرقم الضريبي عند الحاجة).
- التزم بالتنسيق المطلوب تمامًا، واستخدم Markdown للعناوين والقوائم والجداول.
- لا تخترع أرقامًا أو التزامات لم يذكرها المستخدم؛ إن نقصت معلومة اتركها كحقل واضح مثل [يُحدد لاحقًا].
- أخرج المحتوى النهائي مباشرة دون مقدمات مثل "بالتأكيد" أو "إليك".`;

function contextBlock(ctx: PromptContext): string {
  const lines: string[] = [];
  if (ctx.companyName) lines.push(`اسم المنشأة: ${ctx.companyName}`);
  if (ctx.companyIndustry) lines.push(`مجال المنشأة: ${ctx.companyIndustry}`);
  if (ctx.companyTone) lines.push(`نبرة التواصل المعتمدة: ${ctx.companyTone}`);
  if (ctx.writingStyle) lines.push(`أسلوب الكتابة المفضل: ${ctx.writingStyle}`);
  if (ctx.responseTone) lines.push(`نبرة الرد المفضلة: ${ctx.responseTone}`);
  if (ctx.customContext) lines.push(`ملاحظات إضافية: ${ctx.customContext}`);

  return lines.length ? `\n\nسياق المنشأة:\n${lines.join("\n")}` : "";
}

const TASKS: Record<string, string> = {
  quotation: `اكتب عرض سعر تجاريًا كاملًا يتضمن: ترويسة بالأطراف والتاريخ ورقم مرجعي، مقدمة موجزة، نطاق عمل مفصّل، جدول بالبنود والقيمة والمدة، الشروط والأحكام، وخاتمة مع مدة صلاحية العرض.`,
  contract: `اكتب مسودة عقد نظامية ببنود مرقّمة تشمل: التمهيد، محل العقد، المدة، التزامات كل طرف، السرية، الشروط الخاصة، الإنهاء، تسوية النزاعات وفق أنظمة المملكة العربية السعودية، وخانات التوقيع. اجعل الصياغة واضحة ومحكمة.`,
  "social-post": `اكتب منشورًا واحدًا جاهزًا للنشر يناسب طول وأسلوب المنصة المحددة، مع خطاف افتتاحي قوي، ودعوة لاتخاذ إجراء، وقائمة هاشتاقات مقترحة في النهاية.`,
  "customer-reply": `اكتب ردًا واحدًا جاهزًا للإرسال على رسالة العميل. اعترف بالمشكلة إن وُجدت، قدّم حلًا أو خطوة تالية واضحة، وحافظ على سمعة المنشأة دون وعود لم يذكرها المستخدم.`,
  email: `اكتب بريدًا إلكترونيًا مهنيًا يبدأ بسطر موضوع مقترح، ثم تحية، فقرات موجزة تحقق الهدف المذكور، ودعوة واضحة لاتخاذ إجراء، وخاتمة مناسبة.`,
  "ad-copy": `اكتب ثلاث نسخ إعلانية مختلفة الزاوية (منفعة مباشرة، مشكلة وحل، إلحاح). لكل نسخة: عنوان، نص، وزر إجراء. أنهِ بتوصية قصيرة حول أي نسخة تُختبر أولًا.`,
};

export interface BuiltPrompt {
  system: string;
  user: string;
}

export function buildPrompt(
  tool: ToolDefinition,
  input: Record<string, string>,
  ctx: PromptContext
): BuiltPrompt {
  const fields = tool.fields
    .map((field) => {
      const value = input[field.name]?.trim();
      return value ? `${field.label}: ${value}` : null;
    })
    .filter(Boolean)
    .join("\n");

  const system = `${BASE_SYSTEM}${contextBlock(ctx)}`;

  const user = `المهمة: ${TASKS[tool.key] ?? tool.longDescription}

المعطيات:
${fields}

أخرج النتيجة النهائية فقط.`;

  return { system, user };
}

export const CHAT_SYSTEM_PROMPT = `${BASE_SYSTEM}

أنت الآن في وضع المحادثة. أجب بإيجاز ووضوح، واطرح سؤال توضيحي واحد فقط عند الحاجة الحقيقية. إذا كان الطلب يناسب إحدى أدوات المنصة (عروض الأسعار، العقود، المنشورات، الردود، الإيميلات، الإعلانات) فاقترحها باختصار.`;

export function buildChatSystemPrompt(ctx: PromptContext): string {
  return `${CHAT_SYSTEM_PROMPT}${contextBlock(ctx)}`;
}
