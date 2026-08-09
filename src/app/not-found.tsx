import Link from "next/link";

import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <LogoMark className="mb-6 h-12 w-12 opacity-70" />
      <p className="tabular text-sm font-semibold text-brand-400">٤٠٤</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-50">الصفحة غير موجودة</h1>
      <p className="mt-3 max-w-sm text-sm leading-7 text-slate-400">
        الرابط الذي فتحته غير صحيح، أو أن العنصر حُذف أو لم يعد متاحًا لحسابك.
      </p>
      <div className="mt-7 flex gap-3">
        <Button asChild>
          <Link href="/dashboard">العودة للوحة التحكم</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">الصفحة الرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}
