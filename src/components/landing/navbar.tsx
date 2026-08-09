"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#features", label: "الأدوات" },
  { href: "#how", label: "كيف يعمل" },
  { href: "#why", label: "لماذا M9" },
  { href: "#pricing", label: "الأسعار" },
  { href: "#faq", label: "الأسئلة" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-line bg-ink-950/80 backdrop-blur-xl" : ""
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="M9 AI">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:text-slate-100"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">تسجيل الدخول</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">ابدأ مجانًا</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5 md:hidden"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-line bg-ink-950/95 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-5 py-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-2 pt-3">
              <Button asChild variant="secondary" size="sm" className="flex-1">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link href="/register">ابدأ مجانًا</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
