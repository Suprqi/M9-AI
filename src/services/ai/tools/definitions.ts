/**
 * Client-safe tool catalogue. Contains no prompts and no secrets — the UI reads
 * this to render forms, the server reads it to validate input.
 * Adding a tool = add an entry here + a prompt builder in `./prompts.ts`.
 */

export type FieldType = "text" | "textarea" | "number" | "select";

export interface ToolFieldOption {
  value: string;
  label: string;
}

export interface ToolField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  maxLength?: number;
  options?: ToolFieldOption[];
  hint?: string;
}

export type ToolIconKey =
  | "file-text"
  | "scale"
  | "megaphone"
  | "message-circle"
  | "mail"
  | "sparkles";

export interface ToolDefinition {
  key: string;
  name: string;
  description: string;
  longDescription: string;
  icon: ToolIconKey;
  category: "sales" | "legal" | "marketing" | "support";
  /** Shown above the output when the content carries legal/financial weight. */
  disclaimer?: string;
  /** FREE-plan users can only run tools where this is false. */
  proOnly: boolean;
  fields: ToolField[];
}

const TONE_OPTIONS: ToolFieldOption[] = [
  { value: "رسمي", label: "رسمي" },
  { value: "ودّي", label: "ودّي" },
  { value: "مختصر ومباشر", label: "مختصر ومباشر" },
  { value: "حماسي", label: "حماسي" },
  { value: "احترافي محايد", label: "احترافي محايد" },
];

export const TOOLS: ToolDefinition[] = [
  {
    key: "quotation",
    name: "عروض الأسعار",
    description: "عرض سعر احترافي جاهز للإرسال خلال دقيقة.",
    longDescription:
      "اكتب تفاصيل الخدمة والسعر، وسيتولى M9 AI صياغة عرض سعر متكامل بمقدمة ونطاق عمل وشروط وخاتمة.",
    icon: "file-text",
    category: "sales",
    proOnly: false,
    fields: [
      { name: "companyName", label: "اسم شركتك", type: "text", required: true, maxLength: 120, placeholder: "مؤسسة الأفق للمقاولات" },
      { name: "clientName", label: "اسم العميل", type: "text", required: true, maxLength: 120, placeholder: "شركة النخبة التجارية" },
      { name: "serviceType", label: "نوع الخدمة", type: "text", required: true, maxLength: 160, placeholder: "تصميم وتنفيذ واجهة معرض" },
      { name: "serviceDetails", label: "تفاصيل الخدمة", type: "textarea", required: true, maxLength: 2000, placeholder: "اذكر نطاق العمل، المخرجات، وما هو مستثنى…" },
      { name: "price", label: "السعر", type: "text", required: true, maxLength: 60, placeholder: "45,000 ريال شامل الضريبة" },
      { name: "duration", label: "مدة التنفيذ", type: "text", required: true, maxLength: 80, placeholder: "٣ أسابيع من تاريخ الاعتماد" },
      { name: "terms", label: "شروط إضافية", type: "textarea", required: false, maxLength: 1000, placeholder: "الدفعة المقدمة، الضمان، سياسة التعديلات…" },
    ],
  },
  {
    key: "contract",
    name: "كتابة العقود",
    description: "مسودة عقد واضحة بصياغة عربية منظمة.",
    longDescription:
      "أنشئ مسودة عقد مرتبة ببنود مرقّمة تغطي الأطراف والمدة والالتزامات والإنهاء، جاهزة لمراجعة مستشارك القانوني.",
    icon: "scale",
    category: "legal",
    proOnly: true,
    disclaimer:
      "المحتوى مولد بالذكاء الاصطناعي ولا يُعد استشارة قانونية. راجع المسودة مع مختص قبل الاعتماد أو التوقيع.",
    fields: [
      { name: "contractType", label: "نوع العقد", type: "text", required: true, maxLength: 120, placeholder: "عقد تقديم خدمات تسويقية" },
      { name: "partyOne", label: "الطرف الأول", type: "text", required: true, maxLength: 160, placeholder: "الاسم / الكيان + السجل التجاري" },
      { name: "partyTwo", label: "الطرف الثاني", type: "text", required: true, maxLength: 160, placeholder: "الاسم / الكيان + السجل التجاري" },
      { name: "duration", label: "مدة العقد", type: "text", required: true, maxLength: 80, placeholder: "١٢ شهرًا قابلة للتجديد" },
      { name: "details", label: "التفاصيل ونطاق العمل", type: "textarea", required: true, maxLength: 2500, placeholder: "الخدمات المشمولة، المخرجات، آلية الدفع…" },
      { name: "terms", label: "الشروط الخاصة", type: "textarea", required: false, maxLength: 1500, placeholder: "السرية، الملكية الفكرية، الإنهاء المبكر…" },
    ],
  },
  {
    key: "social-post",
    name: "منشورات التواصل",
    description: "منشور جاهز للنشر بأسلوب يناسب منصتك.",
    longDescription:
      "حدد المنصة والجمهور والأسلوب، واحصل على منشور عربي جاهز مع هاشتاقات مقترحة.",
    icon: "megaphone",
    category: "marketing",
    proOnly: false,
    fields: [
      {
        name: "platform",
        label: "المنصة",
        type: "select",
        required: true,
        options: [
          { value: "X (تويتر)", label: "X (تويتر)" },
          { value: "إنستقرام", label: "إنستقرام" },
          { value: "لينكدإن", label: "لينكدإن" },
          { value: "سناب شات", label: "سناب شات" },
          { value: "تيك توك", label: "تيك توك" },
        ],
      },
      { name: "business", label: "نشاط المنشأة", type: "text", required: true, maxLength: 120, placeholder: "مطعم مأكولات بحرية في جدة" },
      { name: "topic", label: "موضوع المنشور", type: "textarea", required: true, maxLength: 800, placeholder: "إطلاق منيو جديد لموسم الصيف" },
      { name: "tone", label: "أسلوب الكتابة", type: "select", required: true, options: TONE_OPTIONS },
      { name: "audience", label: "الجمهور المستهدف", type: "text", required: true, maxLength: 160, placeholder: "العائلات والشباب ٢٥–٤٠ سنة" },
      { name: "cta", label: "الدعوة لاتخاذ إجراء", type: "text", required: false, maxLength: 120, placeholder: "احجز طاولتك الآن" },
    ],
  },
  {
    key: "customer-reply",
    name: "الرد على العملاء",
    description: "رد مهني ومتزن على أي رسالة عميل.",
    longDescription:
      "الصق رسالة العميل — بما فيها الشكاوى الصعبة — واحصل على رد يحافظ على العلاقة وعلى سمعة منشأتك.",
    icon: "message-circle",
    category: "support",
    proOnly: false,
    fields: [
      { name: "customerMessage", label: "رسالة العميل", type: "textarea", required: true, maxLength: 2000, placeholder: "الصق نص رسالة العميل هنا…" },
      { name: "business", label: "نوع النشاط", type: "text", required: true, maxLength: 120, placeholder: "متجر إلكتروني للأثاث" },
      { name: "tone", label: "أسلوب الرد", type: "select", required: true, options: TONE_OPTIONS },
      { name: "notes", label: "معلومات تريد تضمينها", type: "textarea", required: false, maxLength: 800, placeholder: "سياسة الاسترجاع، موعد الشحن المتوقع…" },
    ],
  },
  {
    key: "email",
    name: "كتابة الإيميلات",
    description: "بريد عمل مرتب بموضوع وخاتمة مناسبة.",
    longDescription:
      "حدد المستلم والهدف، واحصل على بريد عربي واضح بسطر موضوع جاهز.",
    icon: "mail",
    category: "sales",
    proOnly: false,
    fields: [
      { name: "recipient", label: "المستلم", type: "text", required: true, maxLength: 160, placeholder: "مدير المشتريات — شركة الرؤية" },
      { name: "subject", label: "الموضوع", type: "text", required: true, maxLength: 160, placeholder: "متابعة عرض السعر المرسل" },
      { name: "goal", label: "الهدف من الرسالة", type: "textarea", required: true, maxLength: 1000, placeholder: "ما الذي تريد أن يفعله المستلم بعد القراءة؟" },
      { name: "tone", label: "الأسلوب", type: "select", required: true, options: TONE_OPTIONS },
    ],
  },
  {
    key: "ad-copy",
    name: "إنشاء الإعلانات",
    description: "عدة نسخ إعلانية جاهزة للاختبار.",
    longDescription:
      "احصل على ثلاث نسخ إعلانية مختلفة الزاوية لتختبر أيها يحقق أفضل أداء.",
    icon: "sparkles",
    category: "marketing",
    proOnly: false,
    fields: [
      { name: "product", label: "المنتج أو الخدمة", type: "text", required: true, maxLength: 160, placeholder: "اشتراك سنوي في صالة رياضية" },
      { name: "audience", label: "الجمهور", type: "text", required: true, maxLength: 160, placeholder: "موظفون في الرياض يبحثون عن لياقة" },
      {
        name: "platform",
        label: "المنصة",
        type: "select",
        required: true,
        options: [
          { value: "إعلانات جوجل", label: "إعلانات جوجل" },
          { value: "ميتا (فيسبوك/إنستقرام)", label: "ميتا (فيسبوك/إنستقرام)" },
          { value: "سناب شات", label: "سناب شات" },
          { value: "تيك توك", label: "تيك توك" },
          { value: "X (تويتر)", label: "X (تويتر)" },
        ],
      },
      { name: "offer", label: "العرض", type: "text", required: true, maxLength: 160, placeholder: "خصم ٣٠٪ لأول ١٠٠ مشترك" },
      { name: "goal", label: "الهدف", type: "text", required: true, maxLength: 120, placeholder: "زيادة الاشتراكات" },
    ],
  },
];

export const TOOL_MAP: Record<string, ToolDefinition> = Object.fromEntries(
  TOOLS.map((tool) => [tool.key, tool])
);

export function getTool(key: string): ToolDefinition | undefined {
  return TOOL_MAP[key];
}

export const TOOL_CATEGORY_LABELS: Record<ToolDefinition["category"], string> = {
  sales: "المبيعات",
  legal: "العقود",
  marketing: "التسويق",
  support: "خدمة العملاء",
};
