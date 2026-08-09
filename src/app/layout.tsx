import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { APP_URL } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "M9 AI — ذكاء اصطناعي لأعمالك",
    template: "%s | M9 AI",
  },
  description:
    "أنجز أعمالك اليومية بذكاء وسرعة باستخدام M9 AI. عروض أسعار، عقود، منشورات، وردود احترافية بالعربية في دقائق.",
  keywords: [
    "ذكاء اصطناعي",
    "عروض أسعار",
    "كتابة عقود",
    "محتوى عربي",
    "الشركات السعودية",
    "M9 AI",
  ],
  authors: [{ name: "M9 AI" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: APP_URL,
    siteName: "M9 AI",
    title: "M9 AI — ذكاء اصطناعي لأعمالك",
    description:
      "أنجز عروض الأسعار، المحتوى، الردود والمستندات التجارية في دقائق باستخدام M9 AI.",
  },
  twitter: {
    card: "summary_large_image",
    title: "M9 AI — ذكاء اصطناعي لأعمالك",
    description:
      "أنجز عروض الأسعار، المحتوى، الردود والمستندات التجارية في دقائق باستخدام M9 AI.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        {children}
        <Toaster
          position="top-center"
          dir="rtl"
          toastOptions={{
            style: {
              background: "#0e1424",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e8edf7",
            },
          }}
        />
      </body>
    </html>
  );
}
