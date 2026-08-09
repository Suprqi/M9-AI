import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-5">
        <div className="glow-brand glass relative overflow-hidden rounded-3xl border border-line-strong px-8 py-14 text-center sm:px-14">
          <div
            className="absolute -top-24 start-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-600/25 blur-[100px]"
            aria-hidden
          />
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            جرّب M9 AI على أول مستند لك اليوم
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-8 text-slate-400">
            سجّل حسابًا مجانيًا وأنشئ عرض سعر احترافي خلال دقيقة واحدة.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                ابدأ مجانًا
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/login">لدي حساب</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-950">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-7 text-slate-500">
              منصة ذكاء اصطناعي عربية تساعد المنشآت السعودية على إنجاز محتواها
              ومستنداتها التجارية بسرعة.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                المنتج
              </p>
              <a href="#features" className="block text-slate-400 hover:text-slate-200">
                الأدوات
              </a>
              <a href="#pricing" className="block text-slate-400 hover:text-slate-200">
                الأسعار
              </a>
              <a href="#faq" className="block text-slate-400 hover:text-slate-200">
                الأسئلة الشائعة
              </a>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                الحساب
              </p>
              <Link href="/login" className="block text-slate-400 hover:text-slate-200">
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="block text-slate-400 hover:text-slate-200"
              >
                إنشاء حساب
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} M9 AI. جميع الحقوق محفوظة.</p>
          <p>المحتوى المولّد بالذكاء الاصطناعي لا يُعد استشارة قانونية أو مالية.</p>
        </div>
      </div>
    </footer>
  );
}
