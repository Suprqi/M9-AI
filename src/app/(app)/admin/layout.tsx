import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

/**
 * Second authorization gate. The shell layout only proves "signed in";
 * every /admin route additionally requires the ADMIN role.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return <>{children}</>;
}
