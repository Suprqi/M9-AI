/**
 * Theme catalogue. Client-safe — the switcher UI and the server-side validator
 * both read from here, so the two can never drift.
 *
 * Themes work by re-declaring the Tailwind colour variables in globals.css
 * under `[data-theme]` / `[data-accent]` on <html>. No component needs to know
 * a theme exists.
 */

export const THEME_MODES = ["dark", "light"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const ACCENTS = ["blue", "violet", "amber"] as const;
export type Accent = (typeof ACCENTS)[number];

export const DEFAULT_MODE: ThemeMode = "dark";
export const DEFAULT_ACCENT: Accent = "blue";

export const MODE_LABELS: Record<ThemeMode, string> = {
  dark: "داكن",
  light: "فاتح",
};

export interface AccentOption {
  key: Accent;
  label: string;
  /** Swatch colours for the picker — mirrors the gradient each accent produces. */
  from: string;
  to: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { key: "blue", label: "أزرق", from: "#2f7dfb", to: "#34d3a6" },
  { key: "violet", label: "بنفسجي", from: "#8b5cf6", to: "#e879f9" },
  { key: "amber", label: "كهرماني", from: "#f59e0b", to: "#fb7185" },
];

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === "string" && THEME_MODES.includes(value as ThemeMode);
}

export function isAccent(value: unknown): value is Accent {
  return typeof value === "string" && ACCENTS.includes(value as Accent);
}
