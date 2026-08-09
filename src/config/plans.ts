/**
 * Single source of truth for plans, quotas and pricing.
 * Prices are intentionally editable here rather than hardcoded in the UI —
 * change a number and both the landing page and the quota engine follow.
 */

export type PlanKey = "FREE" | "PRO" | "BUSINESS";

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  tagline: string;
  /** null = "تواصل معنا" (no fixed public price yet). */
  monthlyPrice: number | null;
  currency: string;
  highlighted: boolean;
  features: string[];
  limits: {
    generationsPerMonth: number;
    chatMessagesPerMonth: number;
    projects: number;
    documents: number;
    teamMembers: number;
    export: boolean;
    allTools: boolean;
  };
}

export const PLANS: Record<PlanKey, PlanDefinition> = {
  FREE: {
    key: "FREE",
    name: "مجاني",
    tagline: "جرّب المنصة وتعرّف على الأدوات",
    monthlyPrice: 0,
    currency: "ر.س",
    highlighted: false,
    features: [
      "٢٠ عملية توليد شهريًا",
      "٥٠ رسالة محادثة شهريًا",
      "الأدوات الأساسية",
      "مشروع واحد",
      "حفظ حتى ١٠ مستندات",
    ],
    limits: {
      generationsPerMonth: 20,
      chatMessagesPerMonth: 50,
      projects: 1,
      documents: 10,
      teamMembers: 1,
      export: false,
      allTools: false,
    },
  },
  PRO: {
    key: "PRO",
    name: "احترافي",
    tagline: "للمستقلين وأصحاب الأعمال الصغيرة",
    monthlyPrice: 99,
    currency: "ر.س",
    highlighted: true,
    features: [
      "٥٠٠ عملية توليد شهريًا",
      "٢٠٠٠ رسالة محادثة شهريًا",
      "جميع الأدوات",
      "مشاريع غير محدودة",
      "حفظ وتنظيم المستندات",
      "تصدير PDF و Word",
      "تخصيص نبرة الكتابة",
    ],
    limits: {
      generationsPerMonth: 500,
      chatMessagesPerMonth: 2000,
      projects: 100,
      documents: 1000,
      teamMembers: 1,
      export: true,
      allTools: true,
    },
  },
  BUSINESS: {
    key: "BUSINESS",
    name: "الأعمال",
    tagline: "للفرق والمؤسسات",
    monthlyPrice: 399,
    currency: "ر.س",
    highlighted: false,
    features: [
      "٥٠٠٠ عملية توليد شهريًا",
      "محادثات غير محدودة عمليًا",
      "مساحة عمل للفريق",
      "إدارة المستخدمين والصلاحيات",
      "هوية وأسلوب موحّد للشركة",
      "تصدير غير محدود",
      "دعم ذو أولوية",
    ],
    limits: {
      generationsPerMonth: 5000,
      chatMessagesPerMonth: 20000,
      projects: 1000,
      documents: 10000,
      teamMembers: 25,
      export: true,
      allTools: true,
    },
  },
};

export const PLAN_ORDER: PlanKey[] = ["FREE", "PRO", "BUSINESS"];

export function getPlan(key: PlanKey): PlanDefinition {
  return PLANS[key];
}
