import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ badge */

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-white/[0.07] text-slate-300",
        brand: "bg-brand-500/15 text-brand-300",
        mint: "bg-mint-500/15 text-mint-300",
        warn: "bg-amber-500/15 text-amber-300",
        danger: "bg-red-500/15 text-red-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/* --------------------------------------------------------------- skeleton */

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------ empty state */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-brand-300">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-400">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- avatar */

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("");

  if (src) {
    // User-supplied avatar URL: next/image would need a remote-host allowlist
    // we do not control, so a plain <img> is the correct trade-off here.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={cn("h-9 w-9 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-mint-500 text-xs font-bold text-white",
        className
      )}
    >
      {letters || "M9"}
    </span>
  );
}

/* --------------------------------------------------------------- section */

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow ? (
        <Badge variant="brand" className="mb-4">
          {eyebrow}
        </Badge>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-8 text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}
