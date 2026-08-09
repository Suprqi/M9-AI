"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { SectionHeading } from "@/components/ui/misc";

const FAQS = [
  {
    q: "هل الخدمة مجانية؟",
    a: "نعم، هناك خطة مجانية دائمة تتيح لك عددًا محدودًا من عمليات التوليد شهريًا مع الأدوات الأساسية. لا نطلب بطاقة ائتمانية للتسجيل، ويمكنك الترقية لاحقًا عندما يزيد استخدامك.",
  },
  {
    q: "هل بياناتي آمنة؟",
    a: "كل حساب معزول تمامًا عن غيره، ولا يمكن لأي مستخدم الوصول إلى مشاريع أو مستندات مستخدم آخر. كلمات المرور مخزّنة بصيغة مشفّرة أحادية الاتجاه، والجلسات قابلة للإلغاء من إعدادات حسابك في أي وقت.",
  },
  {
    q: "هل أستطيع استخدام الخدمة للشركة؟",
    a: "نعم. يمكنك حفظ اسم منشأتك ومجالها ونبرة تواصلها، فتنعكس على كل ما تولّده المنصة. وخطة الأعمال تتيح مساحة عمل مشتركة للفريق وإدارة المستخدمين.",
  },
  {
    q: "هل يمكن تصدير المستندات؟",
    a: "نعم. كل مستند يمكن نسخه، أو تصديره ملف Word، أو طباعته وحفظه PDF من متصفحك مباشرة. التصدير متاح في خطة احترافي وما فوق.",
  },
  {
    q: "هل يدعم العربية؟",
    a: "المنصة عربية أولًا: الواجهة كاملة بالعربية من اليمين إلى اليسار، والمخرجات مكتوبة بصياغة تجارية عربية طبيعية وليست ترجمة آلية عن الإنجليزية.",
  },
  {
    q: "هل المحتوى المولّد صالح قانونيًا؟",
    a: "مخرجات أداة العقود مسودات تساعدك على البدء بسرعة، وليست استشارة قانونية. ننصح دائمًا بمراجعة أي عقد مع مختص قبل الاعتماد أو التوقيع.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 py-24">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow="الأسئلة الشائعة" title="أسئلة نسمعها كثيرًا" />

        <Accordion.Root type="single" collapsible className="mt-12 space-y-3">
          {FAQS.map((item, index) => (
            <Accordion.Item
              key={item.q}
              value={`item-${index}`}
              className="glass overflow-hidden rounded-xl border border-line"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-medium text-slate-100 transition-colors hover:bg-white/[0.03]">
                  {item.q}
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
                    aria-hidden
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:hidden">
                <p className="px-5 pb-5 text-sm leading-8 text-slate-400">{item.a}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
