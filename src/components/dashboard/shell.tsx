"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  CreditCard,
  FileText,
  Folder,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { Logo, LogoMark } from "@/components/brand/logo";
import { Avatar, Badge } from "@/components/ui/misc";
import { ACCOUNT_NAV, ADMIN_NAV, MAIN_NAV, type NavItem } from "@/config/navigation";
import { PLANS, type PlanKey } from "@/config/plans";
import { logoutAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

const ICONS: Record<NavItem["icon"], LucideIcon> = {
  home: Home,
  sparkles: Sparkles,
  folder: Folder,
  "file-text": FileText,
  star: Star,
  "message-square": MessageSquare,
  user: User,
  "credit-card": CreditCard,
  shield: Shield,
};

export interface ShellUser {
  name: string;
  email: string;
  avatarUrl: string | null;
  plan: PlanKey;
  isAdmin: boolean;
}

function isActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = ICONS[item.icon];
  const active = isActive(pathname, item);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-brand-500/15 font-medium text-brand-200"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SidebarContent({
  user,
  pathname,
  onNavigate,
}: {
  user: ShellUser;
  pathname: string;
  onNavigate?: () => void;
}) {
  const usageHref = "/dashboard/subscription";

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link href="/dashboard" onClick={onNavigate} aria-label="M9 AI">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {MAIN_NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}

        <p className="px-3 pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          الحساب
        </p>
        {ACCOUNT_NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}

        {user.isAdmin ? (
          <>
            <p className="px-3 pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              الإدارة
            </p>
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </>
        ) : null}
      </nav>

      <div className="border-t border-line p-3">
        <Link
          href={usageHref}
          onClick={onNavigate}
          className="mb-2 flex items-center justify-between rounded-xl border border-line bg-white/[0.03] px-3 py-2.5 transition-colors hover:border-brand-500/40"
        >
          <span className="text-xs text-slate-400">خطتك الحالية</span>
          <Badge variant={user.plan === "FREE" ? "default" : "mint"}>
            {PLANS[user.plan].name}
          </Badge>
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-red-300"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden />
            تسجيل الخروج
          </button>
        </form>
      </div>
    </div>
  );
}

export function DashboardShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The drawer closes from each link's onNavigate handler rather than from an
  // effect on `pathname` — reacting to the route would re-render twice.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-dvh">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-s-0 border-e border-line bg-ink-900/60 lg:block">
        <SidebarContent user={user} pathname={pathname} />
      </aside>

      {/* mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 end-0 w-72 border-s border-line bg-ink-900 shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute start-3 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/5"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              user={user}
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-ink-950/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="lg:hidden" aria-label="M9 AI">
            <LogoMark className="h-7 w-7" />
          </Link>

          <div className="ms-auto flex items-center gap-2">
            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
              aria-label="الإشعارات"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-mint-400" />
            </button>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5"
            >
              <div className="hidden text-end sm:block">
                <p className="text-sm font-medium leading-tight text-slate-100">
                  {user.name}
                </p>
                <p className="text-[11px] leading-tight text-slate-500">{user.email}</p>
              </div>
              <Avatar name={user.name} src={user.avatarUrl} />
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
