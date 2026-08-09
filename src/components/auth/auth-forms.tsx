"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, Input, Label } from "@/components/ui/input";
import { loginAction, registerAction } from "@/server/actions/auth";
import { IDLE_STATE } from "@/server/actions/types";

function FormError({ message, requestId }: { message?: string; requestId?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        <p>{message}</p>
        {requestId ? (
          <p className="mt-1 text-[11px] text-red-300/60">رقم المرجع: {requestId}</p>
        ) : null}
      </div>
    </div>
  );
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, IDLE_STATE);

  return (
    <Card className="p-7">
      <h1 className="text-xl font-bold text-slate-50">تسجيل الدخول</h1>
      <p className="mt-1.5 text-sm text-slate-400">
        أهلًا بعودتك. أدخل بياناتك للمتابعة إلى مساحة عملك.
      </p>

      <form action={formAction} className="mt-7 space-y-4" noValidate>
        <FormError message={state.message} requestId={state.requestId} />

        <div>
          <Label htmlFor="email" required>
            البريد الإلكتروني
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            placeholder="name@company.com"
            required
            className="mt-1.5 text-start"
          />
          <FieldError message={state.fieldErrors?.email} />
        </div>

        <div>
          <Label htmlFor="password" required>
            كلمة المرور
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5"
          />
          <FieldError message={state.fieldErrors?.password} />
        </div>

        <Button type="submit" className="w-full" loading={pending}>
          {pending ? "جارٍ الدخول…" : "تسجيل الدخول"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="text-brand-300 hover:underline">
          أنشئ حسابًا مجانيًا
        </Link>
      </p>
    </Card>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, IDLE_STATE);

  return (
    <Card className="p-7">
      <h1 className="text-xl font-bold text-slate-50">أنشئ حسابك</h1>
      <p className="mt-1.5 text-sm text-slate-400">
        ابدأ مجانًا — بدون بطاقة ائتمانية، وخلال أقل من دقيقة.
      </p>

      <form action={formAction} className="mt-7 space-y-4" noValidate>
        <FormError message={state.message} requestId={state.requestId} />

        <div>
          <Label htmlFor="name" required>
            الاسم الكامل
          </Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="عبدالله المطيري"
            required
            className="mt-1.5"
          />
          <FieldError message={state.fieldErrors?.name} />
        </div>

        <div>
          <Label htmlFor="companyName">اسم المنشأة</Label>
          <Input
            id="companyName"
            name="companyName"
            autoComplete="organization"
            placeholder="اختياري — يمكنك إضافته لاحقًا"
            className="mt-1.5"
          />
          <FieldError message={state.fieldErrors?.companyName} />
        </div>

        <div>
          <Label htmlFor="email" required>
            البريد الإلكتروني
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            placeholder="name@company.com"
            required
            className="mt-1.5 text-start"
          />
          <FieldError message={state.fieldErrors?.email} />
        </div>

        <div>
          <Label htmlFor="password" required>
            كلمة المرور
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1.5"
          />
          <FieldError message={state.fieldErrors?.password} />
          <p className="mt-1.5 text-xs text-slate-500">٨ أحرف على الأقل.</p>
        </div>

        <Button type="submit" className="w-full" loading={pending}>
          {pending ? "جارٍ إنشاء الحساب…" : "إنشاء الحساب"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        لديك حساب؟{" "}
        <Link href="/login" className="text-brand-300 hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </Card>
  );
}
