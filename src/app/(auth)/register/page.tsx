import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "أنشئ حسابك المجاني في M9 AI وابدأ بإنجاز مستنداتك التجارية.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
