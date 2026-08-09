"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          background: "#05070d",
          color: "#e8edf7",
          fontFamily: "Segoe UI, Tahoma, system-ui, sans-serif",
          display: "flex",
          minHeight: "100dvh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>حدث خطأ غير متوقع</h1>
        <p style={{ marginTop: "0.75rem", color: "#94a3b8", lineHeight: 1.8 }}>
          تعذّر تحميل التطبيق. حاول تحديث الصفحة.
        </p>
        {error.digest ? (
          <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#64748b" }}>
            رقم المرجع: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "1.75rem",
            borderRadius: "0.75rem",
            background: "linear-gradient(to left, #14b88b, #2f7dfb)",
            color: "#fff",
            padding: "0.7rem 1.5rem",
            fontSize: "0.875rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          إعادة المحاولة
        </button>
      </body>
    </html>
  );
}
