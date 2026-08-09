import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AR_DATE = new Intl.DateTimeFormat("ar-SA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(date: Date | string): string {
  return AR_DATE.format(typeof date === "string" ? new Date(date) : date);
}

export function formatRelative(date: Date | string): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - target.getTime();
  const minutes = Math.round(diff / 60_000);

  if (minutes < 1) return "الآن";
  if (minutes < 60) return `قبل ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  const days = Math.round(hours / 24);
  if (days < 30) return `قبل ${days} يوم`;
  return formatDate(target);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ar-SA").format(value);
}

export function truncate(text: string, length = 120): string {
  return text.length <= length ? text : `${text.slice(0, length).trimEnd()}…`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("");
}

export function slugifyFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "-").slice(0, 80) || "document";
}
