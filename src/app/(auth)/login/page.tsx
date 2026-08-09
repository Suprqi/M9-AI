import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "سجّل الدخول إلى مساحة عملك في M9 AI.",
};

export default function LoginPage() {
  return <LoginForm />;
}
