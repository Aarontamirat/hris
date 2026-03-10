import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth";
import { can } from "@/lib/rbac";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const canViewRbac = await can("RBAC:READ");

  return (
    <main className="space-y-3 p-8">
      <h1 className="text-2xl font-semibold">Welcome, {user.firstName}</h1>
      <p className="text-muted-foreground">Role: {user.role?.name ?? "Unassigned"}</p>
      {canViewRbac ? (
        <Link href="/rbac" className="text-sm underline">
          Open RBAC management
        </Link>
      ) : null}
    </main>
  );
}
