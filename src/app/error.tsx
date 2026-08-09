"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server details stay on the server; the client only ever sees the digest.
    console.error("client boundary error", { digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-slate-50">حدث خطأ غير متوقع</h1>
      <p className="mt-3 max-w-sm text-sm leading-7 text-slate-400">
        تعذّر إتمام العملية. حاول مرة أخرى، وإذا تكرر الخطأ تواصل معنا مع رقم المرجع
        أدناه.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-slate-600">رقم المرجع: {error.digest}</p>
      ) : null}
      <Button className="mt-7" onClick={reset}>
        إعادة المحاولة
      </Button>
    </div>
  );
}
