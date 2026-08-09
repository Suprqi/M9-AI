import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import {
  CompanyForm,
  PreferencesForm,
  ProfileForm,
  SecurityForm,
} from "@/components/settings/settings-forms";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "الحساب" };

export default async function SettingsPage() {
  const session = await requireUser();

  const user = await db.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      company: {
        select: {
          name: true,
          industry: true,
          description: true,
          tone: true,
          website: true,
        },
      },
      aiPreference: {
        select: {
          writingStyle: true,
          language: true,
          responseTone: true,
          customContext: true,
        },
      },
    },
  });

  if (!user) return null;

  return (
    <PageShell>
      <PageHeader
        title="الحساب والإعدادات"
        description="بيانات حسابك ومنشأتك وتفضيلات الكتابة والأمان."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-start">
        <div className="space-y-5">
          <ProfileForm name={user.name} email={user.email} />
          <PreferencesForm preferences={user.aiPreference} />
        </div>
        <div className="space-y-5">
          <CompanyForm company={user.company} />
          <SecurityForm />
        </div>
      </div>
    </PageShell>
  );
}
