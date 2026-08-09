import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/shell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        isAdmin: user.role === "ADMIN",
      }}
    >
      {children}
    </DashboardShell>
  );
}
