"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { changePasswordAction, logoutEverywhereAction } from "@/server/actions/auth";
import {
  updateCompanyAction,
  updatePreferencesAction,
  updateProfileAction,
} from "@/server/actions/settings";
import { IDLE_STATE, type ActionState } from "@/server/actions/types";

function useToastFeedback(state: ActionState) {
  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (!state.ok && state.message) toast.error(state.message);
  }, [state]);
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <div className="px-5 pb-5">{children}</div>
    </Card>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, IDLE_STATE);
  useToastFeedback(state);

  return (
    <SettingsCard
      title="الملف الشخصي"
      description="الاسم الذي يظهر في المنصة وفي مخرجاتك."
    >
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="profile-name" required>
            الاسم الكامل
          </Label>
          <Input
            id="profile-name"
            name="name"
            defaultValue={name}
            required
            maxLength={80}
            className="mt-1.5"
          />
          <FieldError message={state.fieldErrors?.name} />
        </div>

        <div>
          <Label htmlFor="profile-email">البريد الإلكتروني</Label>
          <Input
            id="profile-email"
            value={email}
            dir="ltr"
            disabled
            readOnly
            className="mt-1.5 text-start"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            لا يمكن تغيير البريد في هذه النسخة.
          </p>
        </div>

        <Button type="submit" loading={pending}>
          حفظ التغييرات
        </Button>
      </form>
    </SettingsCard>
  );
}

export function CompanyForm({
  company,
}: {
  company: {
    name: string;
    industry: string | null;
    description: string | null;
    tone: string | null;
    website: string | null;
  } | null;
}) {
  const [state, action, pending] = useActionState(updateCompanyAction, IDLE_STATE);
  useToastFeedback(state);

  return (
    <SettingsCard
      title="المنشأة"
      description="هذه البيانات تُستخدم لتوجيه مخرجات الذكاء الاصطناعي بحيث تعكس هوية شركتك."
    >
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="company-name" required>
            اسم المنشأة
          </Label>
          <Input
            id="company-name"
            name="name"
            defaultValue={company?.name ?? ""}
            required
            maxLength={120}
            placeholder="مؤسسة الأفق للمقاولات"
            className="mt-1.5"
          />
          <FieldError message={state.fieldErrors?.name} />
        </div>

        <div>
          <Label htmlFor="company-industry">مجال العمل</Label>
          <Input
            id="company-industry"
            name="industry"
            defaultValue={company?.industry ?? ""}
            maxLength={120}
            placeholder="مقاولات وتشطيبات"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="company-description">وصف المنشأة</Label>
          <Textarea
            id="company-description"
            name="description"
            defaultValue={company?.description ?? ""}
            maxLength={1000}
            placeholder="ماذا تقدّم منشأتك، ولمن؟"
            className="mt-1.5 min-h-24"
          />
        </div>

        <div>
          <Label htmlFor="company-tone">نبرة التواصل</Label>
          <Input
            id="company-tone"
            name="tone"
            defaultValue={company?.tone ?? ""}
            maxLength={120}
            placeholder="رسمية ومختصرة، مع لمسة ودّية"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="company-website">الموقع الإلكتروني</Label>
          <Input
            id="company-website"
            name="website"
            dir="ltr"
            defaultValue={company?.website ?? ""}
            maxLength={200}
            placeholder="https://example.com"
            className="mt-1.5 text-start"
          />
        </div>

        <Button type="submit" loading={pending}>
          حفظ بيانات المنشأة
        </Button>
      </form>
    </SettingsCard>
  );
}

const STYLES = ["professional", "friendly", "concise", "persuasive"] as const;
const STYLE_LABELS: Record<(typeof STYLES)[number], string> = {
  professional: "احترافي",
  friendly: "ودّي",
  concise: "مختصر ومباشر",
  persuasive: "إقناعي",
};

const TONES = ["formal", "neutral", "warm"] as const;
const TONE_LABELS: Record<(typeof TONES)[number], string> = {
  formal: "رسمية",
  neutral: "محايدة",
  warm: "دافئة",
};

export function PreferencesForm({
  preferences,
}: {
  preferences: {
    writingStyle: string;
    language: string;
    responseTone: string;
    customContext: string | null;
  } | null;
}) {
  const [state, action, pending] = useActionState(updatePreferencesAction, IDLE_STATE);
  useToastFeedback(state);

  return (
    <SettingsCard
      title="تفضيلات الذكاء الاصطناعي"
      description="تُطبَّق على كل ما تولّده الأدوات والمحادثة."
    >
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="writingStyle">أسلوب الكتابة</Label>
          <Select
            id="writingStyle"
            name="writingStyle"
            defaultValue={preferences?.writingStyle ?? "professional"}
            className="mt-1.5"
          >
            {STYLES.map((style) => (
              <option key={style} value={style}>
                {STYLE_LABELS[style]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="language">اللغة</Label>
          <Select
            id="language"
            name="language"
            defaultValue={preferences?.language ?? "ar"}
            className="mt-1.5"
          >
            <option value="ar">العربية</option>
            <option value="en">الإنجليزية</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="responseTone">نبرة الرد</Label>
          <Select
            id="responseTone"
            name="responseTone"
            defaultValue={preferences?.responseTone ?? "formal"}
            className="mt-1.5"
          >
            {TONES.map((tone) => (
              <option key={tone} value={tone}>
                {TONE_LABELS[tone]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="customContext">تعليمات إضافية</Label>
          <Textarea
            id="customContext"
            name="customContext"
            defaultValue={preferences?.customContext ?? ""}
            maxLength={1000}
            placeholder="مثال: لا تستخدم الرموز التعبيرية، واذكر دائمًا أن الأسعار غير شاملة الضريبة."
            className="mt-1.5 min-h-24"
          />
        </div>

        <Button type="submit" loading={pending}>
          حفظ التفضيلات
        </Button>
      </form>
    </SettingsCard>
  );
}

export function SecurityForm() {
  const [state, action, pending] = useActionState(changePasswordAction, IDLE_STATE);
  useToastFeedback(state);

  return (
    <SettingsCard
      title="الأمان"
      description="غيّر كلمة المرور، أو أنهِ جميع الجلسات النشطة على كل الأجهزة."
    >
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="currentPassword" required>
            كلمة المرور الحالية
          </Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5"
          />
          <FieldError message={state.fieldErrors?.currentPassword} />
        </div>

        <div>
          <Label htmlFor="newPassword" required>
            كلمة المرور الجديدة
          </Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1.5"
          />
          <FieldError message={state.fieldErrors?.newPassword} />
        </div>

        <div>
          <Label htmlFor="confirmPassword" required>
            تأكيد كلمة المرور
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1.5"
          />
          <FieldError message={state.fieldErrors?.confirmPassword} />
        </div>

        <Button type="submit" loading={pending}>
          تغيير كلمة المرور
        </Button>
      </form>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm font-medium text-slate-200">الجلسات النشطة</p>
        <p className="mt-1 text-xs leading-6 text-slate-500">
          إنهاء جميع الجلسات يسجّل خروجك من كل الأجهزة، بما فيها هذا الجهاز.
        </p>
        <div className="mt-4">
          <ConfirmDialog
            title="تسجيل الخروج من جميع الأجهزة"
            description="سيتم إنهاء كل الجلسات النشطة وستحتاج إلى تسجيل الدخول مرة أخرى."
            confirmLabel="إنهاء كل الجلسات"
            trigger={
              <Button variant="outline" size="sm">
                تسجيل الخروج من جميع الأجهزة
              </Button>
            }
            onConfirm={async () => {
              await logoutEverywhereAction();
            }}
          />
        </div>
      </div>
    </SettingsCard>
  );
}
