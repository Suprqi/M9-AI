/**
 * Local development seed. Creates a demo company, a demo user, an admin user,
 * projects, documents and a conversation so every screen has realistic content.
 *
 * Run with: npm run db:seed
 * Uses only fictional data — never real personal information.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { TOOLS } from "../src/services/ai/tools/definitions";

const db = new PrismaClient();

const DEMO_EMAIL = "demo@m9.ai";
const ADMIN_EMAIL = "admin@m9.ai";
const DEMO_PASSWORD = "Demo1234!";

async function main() {
  console.log("Seeding M9 AI development data…");

  // Tool catalogue — keeps admin reporting joinable without hardcoded SQL.
  for (const tool of TOOLS) {
    await db.aITool.upsert({
      where: { key: tool.key },
      create: {
        key: tool.key,
        name: tool.name,
        description: tool.description,
        category: tool.category,
      },
      update: {
        name: tool.name,
        description: tool.description,
        category: tool.category,
      },
    });
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const company = await db.company.upsert({
    where: { id: "demo-company" },
    create: {
      id: "demo-company",
      name: "مؤسسة الأفق للمقاولات",
      industry: "مقاولات وتشطيبات",
      description:
        "مؤسسة سعودية متخصصة في تنفيذ وتشطيب المشاريع التجارية والسكنية في منطقة الرياض.",
      tone: "رسمية ومختصرة مع لمسة ودّية",
      website: "https://alofuq.example.com",
    },
    update: {},
  });

  const demoUser = await db.user.upsert({
    where: { email: DEMO_EMAIL },
    create: {
      email: DEMO_EMAIL,
      name: "عبدالله المطيري",
      passwordHash,
      companyId: company.id,
      aiPreference: {
        create: {
          writingStyle: "professional",
          language: "ar",
          responseTone: "formal",
          customContext: "اذكر دائمًا أن الأسعار غير شاملة ضريبة القيمة المضافة.",
        },
      },
      subscription: {
        create: { plan: "PRO", currentPeriodEnd: periodEnd },
      },
    },
    update: { passwordHash, companyId: company.id },
  });

  await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      name: "مدير النظام",
      passwordHash,
      role: "ADMIN",
      companyId: company.id,
      aiPreference: { create: {} },
      subscription: { create: { plan: "BUSINESS", currentPeriodEnd: periodEnd } },
    },
    update: { passwordHash, role: "ADMIN" },
  });

  const restaurant = await db.project.upsert({
    where: { id: "demo-project-restaurant" },
    create: {
      id: "demo-project-restaurant",
      name: "مطعم عبدالله",
      description: "كل ما يخص افتتاح الفرع الجديد: عروض، منشورات، إعلانات وردود.",
      ownerId: demoUser.id,
      companyId: company.id,
    },
    update: {},
  });

  const tower = await db.project.upsert({
    where: { id: "demo-project-tower" },
    create: {
      id: "demo-project-tower",
      name: "برج النخبة التجاري",
      description: "مشروع تشطيب الواجهة والأدوار الثلاثة الأولى.",
      ownerId: demoUser.id,
      companyId: company.id,
    },
    update: {},
  });

  const documents = [
    {
      id: "demo-doc-quote",
      title: "عروض الأسعار — شركة النخبة التجارية",
      toolKey: "quotation",
      projectId: tower.id,
      favorite: true,
      content: `# عرض سعر

**من:** مؤسسة الأفق للمقاولات
**إلى:** شركة النخبة التجارية
**المرجع:** Q-104882

## مقدمة

يسرّنا أن نقدّم لكم هذا العرض بخصوص **تصميم وتنفيذ واجهة البرج التجاري**، بعد دراسة متطلباتكم بعناية.

## نطاق العمل

- تصميم الواجهة الخارجية بمواد كلادينج مقاوم للعوامل الجوية.
- توريد وتركيب الإنارة المعمارية.
- تسليم المخططات التنفيذية معتمدة.

## القيمة والمدة

| البند | التفاصيل |
| --- | --- |
| القيمة الإجمالية | 245,000 ريال |
| مدة التنفيذ | ٨ أسابيع |

## الشروط والأحكام

١. دفعة مقدمة ٥٠٪ عند اعتماد العرض.
٢. يبدأ احتساب المدة من تاريخ استلام الدفعة.

مع خالص التقدير،
**مؤسسة الأفق للمقاولات**`,
    },
    {
      id: "demo-doc-post",
      title: "منشورات التواصل — افتتاح الفرع الجديد",
      toolKey: "social-post",
      projectId: restaurant.id,
      favorite: false,
      content: `**منشور مقترح — إنستقرام**

افتتاح الفرع الجديد في شمال الرياض 🎉

في مطعم عبدالله نؤمن أن التفاصيل الصغيرة هي ما يصنع الفرق، ولهذا حرصنا أن تكون تجربة الفرع الجديد على قدر توقعاتكم.

احجز طاولتك الآن 👇

—
**هاشتاقات مقترحة:**
#مطعم_عبدالله #الرياض #افتتاح_جديد`,
    },
    {
      id: "demo-doc-reply",
      title: "الرد على العملاء — تأخر الطلب",
      toolKey: "customer-reply",
      projectId: restaurant.id,
      favorite: false,
      content: `عزيزنا العميل،

شكرًا لتواصلك معنا، ونعتذر عن التأخر الذي حصل في طلبك.

راجعنا الحالة مع فريق التشغيل، وتبيّن أن الضغط في ساعة الذروة كان السبب. أضفنا لحسابك رصيدًا بقيمة الطلب كاعتذار، وسيصلك خلال ٢٤ ساعة.

نقدّر لك صبرك، ونعدك بتجربة أفضل في المرة القادمة.

مع خالص التقدير،
فريق خدمة العملاء — مطعم عبدالله`,
    },
  ];

  for (const document of documents) {
    await db.document.upsert({
      where: { id: document.id },
      create: { ...document, ownerId: demoUser.id, status: "FINAL" },
      update: {},
    });
  }

  const conversation = await db.conversation.upsert({
    where: { id: "demo-conversation" },
    create: {
      id: "demo-conversation",
      title: "أفكار لحملة الافتتاح",
      userId: demoUser.id,
    },
    update: {},
  });

  const existingMessages = await db.message.count({
    where: { conversationId: conversation.id },
  });

  if (existingMessages === 0) {
    await db.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          role: "USER",
          content: "أبغى أفكار لحملة افتتاح فرع مطعم جديد في شمال الرياض.",
        },
        {
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: `إليك ثلاث زوايا للحملة:

1. **العد التنازلي** — منشورات يومية قبل الافتتاح بأسبوع تبني الترقّب.
2. **الطبق الموقّع** — ركّز على صنف واحد مميز بدل عرض المنيو كاملًا.
3. **دعوة المجتمع المحلي** — تعاون مع حسابات حي الافتتاح لا مع مشاهير عامّين.

أي زاوية تفضّل أن أبدأ بصياغتها؟`,
        },
      ],
    });
  }

  // A few generations so the admin dashboard has a usage series to draw.
  const existingGenerations = await db.generation.count({
    where: { userId: demoUser.id },
  });

  if (existingGenerations === 0) {
    const now = Date.now();
    await db.generation.createMany({
      data: Array.from({ length: 14 }).map((_, index) => {
        const tool = TOOLS[index % TOOLS.length];
        return {
          toolKey: tool?.key ?? "quotation",
          status: index === 5 ? ("FAILED" as const) : ("SUCCESS" as const),
          provider: "mock",
          model: "m9-mock-1",
          input: { seeded: "true" },
          output: index === 5 ? "" : "نتيجة تجريبية.",
          errorCode: index === 5 ? "AI_PROVIDER_ERROR" : null,
          tokensIn: 320,
          tokensOut: 640,
          durationMs: 900,
          userId: demoUser.id,
          projectId: index % 2 === 0 ? restaurant.id : tower.id,
          createdAt: new Date(now - index * 12 * 60 * 60 * 1000),
        };
      }),
    });

    const period = `${new Date().getUTCFullYear()}-${String(
      new Date().getUTCMonth() + 1
    ).padStart(2, "0")}`;

    await db.usage.upsert({
      where: { userId_period: { userId: demoUser.id, period } },
      create: {
        userId: demoUser.id,
        period,
        generations: 14,
        chatMessages: 2,
        tokensUsed: 13_440,
      },
      update: {},
    });
  }

  console.log("Seed complete.");
  console.log(`  Demo user:  ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Admin user: ${ADMIN_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
