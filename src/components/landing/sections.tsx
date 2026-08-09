import {
  Building2,
  Fingerprint,
  Gauge,
  MousePointerClick,
  PencilLine,
  Settings2,
  Sparkles,
  Timer,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/misc";
import { ToolIcon } from "@/components/tool-icon";
import { TOOLS, TOOL_CATEGORY_LABELS } from "@/services/ai/tools/definitions";

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="الأدوات"
          title="ست أدوات تغطي يومك التجاري"
          description="كل أداة مضبوطة لمهمة واحدة تنجزها جيدًا — بدل مطالبة نموذج عام بأن يخمّن ما تريد."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Card
              key={tool.key}
              id={`tool-${tool.key}`}
              className="scroll-mt-24 p-6 transition-colors duration-200 hover:border-brand-500/40"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-mint-500/20 text-brand-300 ring-1 ring-inset ring-white/10">
                <ToolIcon name={tool.icon} className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-50">{tool.name}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">{tool.description}</p>
              <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                {TOOL_CATEGORY_LABELS[tool.category]}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: MousePointerClick,
    title: "اختر الأداة",
    body: "حدد ما تحتاجه: عرض سعر، عقد، منشور، رد على عميل، بريد، أو إعلان.",
  },
  {
    icon: PencilLine,
    title: "اكتب طلبك",
    body: "املأ حقولًا قليلة وواضحة — لا حاجة لتعلّم كتابة الأوامر أو التعليمات.",
  },
  {
    icon: Sparkles,
    title: "احصل على نتيجة جاهزة",
    body: "نص عربي احترافي جاهز للنسخ أو الحفظ في مشروع أو التصدير كمستند.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 border-y border-line bg-ink-900/40 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="كيف يعمل"
          title="ثلاث خطوات، ولا شيء تتعلمه"
          description="من فتح الأداة إلى مستند جاهز — أقل من دقيقتين."
        />

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            className="absolute inset-x-0 top-[42px] -z-10 hidden h-px bg-gradient-to-l from-transparent via-line-strong to-transparent md:block"
            aria-hidden
          />
          {STEPS.map((step, index) => (
            <li key={step.title} className="text-center">
              <div className="mx-auto mb-5 flex h-[84px] w-[84px] items-center justify-center rounded-2xl border border-line-strong bg-ink-900 shadow-lg">
                <step.icon className="h-7 w-7 text-mint-400" aria-hidden />
              </div>
              <p className="tabular mb-2 text-xs font-semibold text-brand-400">
                الخطوة {index + 1}
              </p>
              <h3 className="text-lg font-semibold text-slate-50">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-7 text-slate-400">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const REASONS = [
  {
    icon: Building2,
    title: "عربي ومصمم للسوق السعودي",
    body: "صياغة تجارية سعودية متعارف عليها، لا ترجمة حرفية من الإنجليزية.",
  },
  {
    icon: Gauge,
    title: "سريع",
    body: "مستند كامل في أقل من دقيقة، بدل ساعة من الصياغة والمراجعة.",
  },
  {
    icon: MousePointerClick,
    title: "بسيط",
    body: "نماذج واضحة بدل صندوق محادثة فارغ. لا يحتاج موظفوك إلى تدريب.",
  },
  {
    icon: Timer,
    title: "يوفر وقت الموظفين",
    body: "فريقك يراجع ويعتمد بدل أن يكتب من الصفر كل مرة.",
  },
  {
    icon: Fingerprint,
    title: "يحافظ على هوية شركتك",
    body: "احفظ اسم منشأتك ومجالها ونبرة تواصلها مرة واحدة، وتُطبَّق على كل مخرجاتك.",
  },
  {
    icon: Settings2,
    title: "قابل للتخصيص",
    body: "عدّل أي مخرج داخل المحرر، أو أعد التوليد بأسلوب مختلف بضغطة.",
  },
];

export function WhyM9() {
  return (
    <section id="why" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="لماذا M9 AI"
          title="أدوات عامة كثيرة… وواحدة تفهم سوقك"
          description="بُني M9 AI حول طريقة عمل المنشآت السعودية الصغيرة والمتوسطة، لا حول عرض تقني."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((reason) => (
            <Card key={reason.title} className="p-6">
              <reason.icon className="mb-4 h-5 w-5 text-mint-400" aria-hidden />
              <h3 className="text-base font-semibold text-slate-50">{reason.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">{reason.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
