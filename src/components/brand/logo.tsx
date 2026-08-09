import { cn } from "@/lib/utils";

/**
 * M9 AI mark. Vector placeholder that matches the brand direction (blue → teal
 * gradient, circuit traces). Swap the paths for the official artwork by
 * replacing this file only — every usage goes through <Logo /> / <LogoMark />.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="M9 AI"
      className={cn("h-9 w-9", className)}
    >
      <defs>
        <linearGradient id="m9-grad" x1="4" y1="8" x2="60" y2="56">
          <stop offset="0%" stopColor="#2f7dfb" />
          <stop offset="100%" stopColor="#34d3a6" />
        </linearGradient>
      </defs>

      {/* M */}
      <path
        d="M8 54V12h7.5l12.5 16 4-5.2v13.4L28 44 15.5 28.4V54H8Z"
        fill="url(#m9-grad)"
      />

      {/* 9 with circular counter */}
      <path
        d="M40.5 8c8.6 0 15.5 6.9 15.5 15.6 0 4.6-1.7 8.2-5 12.4L36.2 56h-9.5l12.6-16.6c-7.4-.7-13-6.6-13-14.3C26.3 15.9 32.5 8 40.5 8Zm.2 8.6a7.1 7.1 0 1 0 0 14.2 7.1 7.1 0 0 0 0-14.2Z"
        fill="url(#m9-grad)"
      />

      {/* circuit traces */}
      <g stroke="url(#m9-grad)" strokeWidth="1.9" strokeLinecap="round" fill="none">
        <path d="M6 40h4.5l4-4h12" />
        <path d="M6 45.5h4.5l4-4h12" />
        <path d="M6 51h4.5l4-4h12" />
      </g>
      <g fill="url(#m9-grad)">
        <circle cx="4.6" cy="40" r="1.9" />
        <circle cx="4.6" cy="45.5" r="1.9" />
        <circle cx="4.6" cy="51" r="1.9" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8" />
      <span className="text-lg font-bold tracking-tight">
        <span className="text-brand-400">M9</span>{" "}
        <span className="text-mint-400">AI</span>
      </span>
    </span>
  );
}
