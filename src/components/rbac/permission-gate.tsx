import { can } from "@/lib/rbac";

export async function PermissionGate({
  permission,
  children,
  fallback = null
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const allowed = await can(permission);
  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
