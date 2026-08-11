"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Lock, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/misc";
import {
  ACCENT_OPTIONS,
  MODE_LABELS,
  THEME_MODES,
  type Accent,
  type ThemeMode,
} from "@/config/themes";
import { updateThemeAction } from "@/server/actions/theme";
import { cn } from "@/lib/utils";

/** Applies the choice to <html> immediately; the server call then persists it. */
function preview(mode: ThemeMode, accent: Accent) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.dataset.accent = accent;
}

export function ThemeSwitcher({
  mode: initialMode,
  accent: initialAccent,
  enabled,
}: {
  mode: ThemeMode;
  accent: Accent;
  enabled: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [accent, setAccent] = useState<Accent>(initialAccent);
  const [pending, startTransition] = useTransition();

  function apply(nextMode: ThemeMode, nextAccent: Accent) {
    const prevMode = mode;
    const prevAccent = accent;

    setMode(nextMode);
    setAccent(nextAccent);
    preview(nextMode, nextAccent);

    startTransition(async () => {
      const result = await updateThemeAction(nextMode, nextAccent);
      if (!result.ok) {
        // Roll the preview back so the UI never claims a change that failed.
        setMode(prevMode);
        setAccent(prevAccent);
        preview(prevMode, prevAccent);
        toast.error(result.message ?? "تعذر تحديث المظهر.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>المظهر</CardTitle>
          {enabled ? null : (
            <Badge variant="warn">
              <Lock className="h-3 w-3" />
              احترافي
            </Badge>
          )}
        </div>
        <CardDescription>
          {enabled
            ? "اختر الوضع واللون الأساسي — يُطبَّق فورًا ويُحفظ في حسابك."
            : "تخصيص المظهر متاح في خطة احترافي وما فوق."}
        </CardDescription>
      </CardHeader>

      <div className="px-5 pb-5">
        <fieldset disabled={!enabled || pending} className="disabled:opacity-60">
          <legend className="mb-2 text-sm font-medium text-slate-300">الوضع</legend>
          <div className="grid grid-cols-2 gap-3">
            {THEME_MODES.map((option) => {
              const active = mode === option;
              const Icon = option === "dark" ? Moon : Sun;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => apply(option, accent)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-start transition-colors",
                    active
                      ? "border-brand-500 bg-brand-500/10"
                      : "border-line-strong hover:bg-white/5",
                    enabled ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      option === "dark"
                        ? "bg-[#0a0e1a] text-slate-300"
                        : "bg-[#f6f8fc] text-[#172033]"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="flex-1 text-sm text-slate-200">
                    {MODE_LABELS[option]}
                  </span>
                  {active ? (
                    <Check className="h-4 w-4 text-brand-300" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>

          <legend className="mb-2 mt-6 text-sm font-medium text-slate-300">
            اللون الأساسي
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {ACCENT_OPTIONS.map((option) => {
              const active = accent === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => apply(mode, option.key)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors",
                    active ? "border-brand-500 bg-brand-500/10" : "border-line-strong hover:bg-white/5",
                    enabled ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                >
                  <span
                    className="h-8 w-8 rounded-full ring-1 ring-inset ring-white/20"
                    style={{
                      background: `linear-gradient(135deg, ${option.from}, ${option.to})`,
                    }}
                    aria-hidden
                  />
                  <span className="text-xs text-slate-300">{option.label}</span>
                  {active ? (
                    <Check className="h-3.5 w-3.5 text-brand-300" aria-hidden />
                  ) : (
                    <span className="h-3.5" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        {enabled ? null : (
          <Button asChild variant="secondary" size="sm" className="mt-5 w-full">
            <Link href="/dashboard/subscription">ترقية الخطة</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
