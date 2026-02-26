import { getAuthenticatedUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const SUPER_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

function normalizePermissionKey(permission: string) {
  return permission.trim().toUpperCase();
}

export async function getCurrentUserPermissionKeys() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  if (user.role?.name && SUPER_ROLES.has(user.role.name.toUpperCase())) {
    return ["*"];
  }

  if (!user.roleId) {
    return [];
  }

  const permissions = await prisma.rolePermission.findMany({
    where: {
      roleId: user.roleId,
      deletedAt: null,
      permission: { deletedAt: null }
    },
    include: {
      permission: {
        select: {
          module: true,
          action: true
        }
      }
    }
  });

  return permissions.map(
    (entry: { permission: { module: string; action: string } }) =>
      normalizePermissionKey(`${entry.permission.module}:${entry.permission.action}`)
  );
}

export async function requirePermission(requiredPermission: string) {
  const permissionKeys = await getCurrentUserPermissionKeys();
  const normalized = normalizePermissionKey(requiredPermission);

  if (!permissionKeys.includes("*") && !permissionKeys.includes(normalized)) {
    throw new AppError("Forbidden", 403, "FORBIDDEN", {
      requiredPermission: normalized
    });
  }
}

export async function can(requiredPermission: string) {
  const permissionKeys = await getCurrentUserPermissionKeys();
  const normalized = normalizePermissionKey(requiredPermission);
  return permissionKeys.includes("*") || permissionKeys.includes(normalized);
}
