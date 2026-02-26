import { redirect } from "next/navigation";

import { PermissionGate } from "@/components/rbac/permission-gate";
import { Card } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RbacPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.permission.findMany({ where: { deletedAt: null }, orderBy: [{ module: "asc" }, { action: "asc" }], take: 20 })
  ]);

  return (
    <main className="space-y-6 p-8">
      <h1 className="text-2xl font-semibold">RBAC Management</h1>

      <PermissionGate permission="RBAC:READ" fallback={<p className="text-red-600">You do not have RBAC:READ</p>}>
        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-lg font-medium">Roles</h2>
            <ul className="space-y-2 text-sm">
              {roles.map((role) => (
                <li key={role.id} className="rounded border p-2">
                  <strong>{role.name}</strong>
                  <p className="text-muted-foreground">{role.description ?? "No description"}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-medium">Permissions</h2>
            <ul className="space-y-2 text-sm">
              {permissions.map((permission) => (
                <li key={permission.id} className="rounded border p-2">
                  <strong>{permission.module}:{permission.action}</strong>
                  <p className="text-muted-foreground">{permission.description ?? "No description"}</p>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </PermissionGate>
    </main>
  );
}
