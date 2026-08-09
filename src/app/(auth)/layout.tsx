import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="bg-grid absolute inset-0 -z-10 opacity-50" aria-hidden />
      <div
        className="absolute -top-32 start-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-600/20 blur-[110px]"
        aria-hidden
      />

      <header className="flex items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" aria-label="M9 AI">
          <Logo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          العودة للرئيسية
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
