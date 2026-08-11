import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/dashboard/page-header";
import {
  CompanyForm,
  PreferencesForm,
  ProfileForm,
  SecurityForm,
} from "@/components/settings/settings-forms";
import { ThemeSwitcher } from "@/components/settings/theme-switcher";
import { PLANS } from "@/config/plans";
import {
  DEFAULT_ACCENT,
  DEFAULT_MODE,
  isAccent,
  isThemeMode,
} from "@/config/themes";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getPlanFor } from "@/lib/usage";

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

  const plan = await getPlanFor(session.id);

  return (
    <PageShell>
      <PageHeader
        title="الحساب والإعدادات"
        description="بيانات حسابك ومنشأتك وتفضيلات الكتابة والأمان."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-start">
        <div className="space-y-5">
          <ProfileForm name={user.name} email={user.email} />
          <ThemeSwitcher
            mode={isThemeMode(session.themeMode) ? session.themeMode : DEFAULT_MODE}
            accent={isAccent(session.accent) ? session.accent : DEFAULT_ACCENT}
            enabled={PLANS[plan].limits.themes}
          />
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
