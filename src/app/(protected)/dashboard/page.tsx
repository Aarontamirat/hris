import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Welcome, {user.firstName}</h1>
      <p className="text-muted-foreground">Role: {user.role?.name ?? "Unassigned"}</p>
    </main>
  );
}
