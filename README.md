# M9 AI

منصة ذكاء اصطناعي عربية للشركات والمؤسسات الصغيرة والمتوسطة في السعودية — تساعد
صاحب العمل على إنشاء المحتوى والمستندات والردود التجارية بسرعة.

> **Arabic-first.** الواجهة كاملة بالعربية RTL. بنية الترجمة جاهزة لإضافة
> الإنجليزية LTR لاحقًا (`AIPreference.language`, `<html lang dir>`).

---

## التقنيات

| الطبقة | الاختيار |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript strict |
| Styling | Tailwind CSS v4 + مكوّنات UI مبنية داخليًا بنمط shadcn (Radix + CVA) |
| Icons | lucide-react |
| Backend | Next.js Server Actions + Route Handlers |
| Database | PostgreSQL + Prisma ORM |
| Auth | جلسات مخزّنة في قاعدة البيانات (bcrypt + ملف تعريف ارتباط httpOnly) |
| AI | طبقة تجريد قابلة للتبديل — مزود تجريبي مدمج + مزود Anthropic |

---

## التشغيل السريع

```bash
npm install
```

```bash
cp .env.example .env
```

عبّئ `DATABASE_URL` و `AUTH_SECRET` ثم طبّق الهجرة الأولى (مرفقة جاهزة في
`prisma/migrations/`):

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

```bash
npm run dev
```

الموقع على `http://localhost:3000`.

### حسابات العرض التجريبي

| الحساب | البريد | كلمة المرور |
| --- | --- | --- |
| مستخدم (خطة احترافي) | `demo@m9.ai` | `Demo1234!` |
| مدير النظام | `admin@m9.ai` | `Demo1234!` |

بيانات وهمية بالكامل — غيّرها قبل أي نشر.

---

## متغيرات البيئة

| المتغير | مطلوب | الوصف |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | سلسلة اتصال PostgreSQL |
| `AUTH_SECRET` | ✅ | مفتاح توقيع رموز الجلسات (٣٢ بايت عشوائية) |
| `AI_PROVIDER` | — | `mock` (افتراضي) أو `anthropic` |
| `AI_API_KEY` | — | مفتاح المزود — يُقرأ في الخادم فقط |
| `AI_MODEL` | — | افتراضيًا `claude-opus-5` |
| `NEXT_PUBLIC_APP_URL` | — | يُستخدم في SEO و sitemap |

توليد `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**لا تضع أي مفتاح حقيقي في Git.** ملف `.env` مستثنى في `.gitignore`.

---

## المزود التجريبي (يعمل بدون API Key)

المنتج كامل الوظائف بدون أي مفتاح: `MockProvider` يبني مستندات عربية حقيقية
البنية من الحقول المدخلة. عند ضبط `AI_PROVIDER=anthropic` مع `AI_API_KEY` ينتقل
النظام تلقائيًا إلى المزود الحقيقي — بدون تغيير أي صفحة أو مكوّن.

إضافة مزود جديد:

1. أنشئ صنفًا في `src/services/ai/providers/` يحقق واجهة `AIProvider`.
2. أضِفه إلى `getAIProvider()` في `src/services/ai/index.ts`.

---

## بنية المشروع

```
prisma/            schema.prisma + seed.ts
src/
  app/
    (auth)/        تسجيل الدخول وإنشاء الحساب
    (app)/         مساحة العمل المحمية (dashboard, ai, admin)
    api/           Route Handlers (تصدير المستندات)
    page.tsx       الصفحة الرئيسية التسويقية
  components/
    brand/ landing/ dashboard/ tools/ documents/ projects/ chat/ settings/ ui/
  config/          plans.ts (الخطط والحدود), navigation.ts
  lib/             db, env, errors, rate-limit, usage, utils, auth/
  server/actions/  Server Actions (auth, tools, documents, projects, chat, settings)
  services/        ai/ (المزودون + الأدوات + الـprompts), generation.ts, chat.ts
```

---

## الأمان

- **الجلسات**: رمز عشوائي في ملف تعريف ارتباط `httpOnly` + `SameSite=Lax`؛
  القاعدة تخزن HMAC للرمز فقط، فلا يمكن إعادة استخدام نسخة مسروقة من القاعدة.
- **التفويض**: كل استعلام مقيّد بـ`ownerId`/`userId`، ولوحة الإدارة خلف بوابة
  دور مستقلة.
- **التحقق**: مخططات Zod على الخادم لكل مدخل — التحقق في المتصفح للراحة فقط.
- **الحدود**: `Rate limiting` على المصادقة وعمليات الذكاء الاصطناعي والكتابة،
  وحدود الاستخدام تُفرض في الخادم قبل استدعاء أي مزود.
- **الأخطاء**: رسائل عربية عامة للمستخدم + سجل خادم منظّم يحمل
  `requestId/endpoint/timestamp` بدون أي أسرار أو محتوى مستخدم.
- **المفاتيح**: `AI_API_KEY` لا يُستورد إطلاقًا في أي مكوّن عميل
  (`src/lib/env.ts` و`src/services/ai/index.ts` محميّان بـ`server-only`).

الحدّ الحالي: مُحدِّد المعدّل في الذاكرة يناسب نسخة MVP بخادم واحد — استبدله
بـRedis عند التوسّع لأكثر من عملية.

---

## الأوامر

```bash
npm run dev        # خادم التطوير
npm run build      # prisma generate + next build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run db:migrate # Prisma migrations
npm run db:seed    # بيانات تجريبية
npm run db:studio  # Prisma Studio
```

---

## ما هو خارج نطاق هذه النسخة

- بوابة الدفع (بنية `Subscription` و`Usage` جاهزة؛ تغيير الخطة يدوي حاليًا).
- تسجيل الدخول عبر Google (جدول `Account` جاهز لإضافته).
- مساحة عمل الفريق متعددة المستخدمين (`Company` و`teamMembers` مهيّأة في المخطط).
