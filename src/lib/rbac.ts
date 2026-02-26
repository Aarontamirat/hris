import { getAuthenticatedUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export async function getCurrentUserPermissionKeys() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
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

  return permissions.map((entry: { permission: { module: string; action: string } }) => `${entry.permission.module}:${entry.permission.action}`);
}

export async function requirePermission(requiredPermission: string) {
  const permissionKeys = await getCurrentUserPermissionKeys();
  if (!permissionKeys.includes(requiredPermission)) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }
}

export async function can(requiredPermission: string) {
  const permissionKeys = await getCurrentUserPermissionKeys();
  return permissionKeys.includes(requiredPermission);
}
