import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import {
  assignRolePermissionsSchema,
  createPermissionSchema,
  createRoleSchema,
  listPermissionsSchema,
  paginationSchema
} from "@/schemas/rbac";

export class RbacService {
  static async listRoles(rawQuery: unknown) {
    const query = paginationSchema.parse(rawQuery);
    const where = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { description: { contains: query.search } }
            ]
          }
        : {})
    };

    const [total, rows] = await prisma.$transaction([
      prisma.role.count({ where }),
      prisma.role.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              users: true,
              rolePermissions: { where: { deletedAt: null } }
            }
          }
        }
      })
    ]);

    return {
      data: rows.map((role: { id: string; name: string; description: string | null; _count: { users: number; rolePermissions: number }; createdAt: Date }) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        usersCount: role._count.users,
        permissionsCount: role._count.rolePermissions,
        createdAt: role.createdAt
      })),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize)
      }
    };
  }

  static async createRole(payload: unknown) {
    const dto = createRoleSchema.parse(payload);
    const role = await prisma.role.create({ data: dto });
    return { data: role };
  }

  static async listPermissions(rawQuery: unknown) {
    const query = listPermissionsSchema.parse(rawQuery);
    const where = {
      deletedAt: null,
      ...(query.module ? { module: query.module } : {}),
      ...(query.search
        ? {
            OR: [
              { module: { contains: query.search } },
              { action: { contains: query.search } },
              { description: { contains: query.search } }
            ]
          }
        : {})
    };

    const [total, rows] = await prisma.$transaction([
      prisma.permission.count({ where }),
      prisma.permission.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: [{ module: "asc" }, { action: "asc" }]
      })
    ]);

    return {
      data: rows,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize)
      }
    };
  }

  static async createPermission(payload: unknown) {
    const dto = createPermissionSchema.parse(payload);
    const permission = await prisma.permission.create({ data: dto });
    return { data: permission };
  }

  static async setRolePermissions(roleId: string, payload: unknown) {
    const dto = assignRolePermissionsSchema.parse(payload);

    const role = await prisma.role.findFirst({ where: { id: roleId, deletedAt: null } });
    if (!role) {
      throw new AppError("Role not found", 404, "ROLE_NOT_FOUND");
    }

    const permissions = await prisma.permission.findMany({
      where: { id: { in: dto.permissionIds }, deletedAt: null },
      select: { id: true }
    });

    if (permissions.length !== dto.permissionIds.length) {
      throw new AppError("One or more permissions are invalid", 422, "INVALID_PERMISSION_IDS");
    }

    await prisma.$transaction(async (tx: typeof prisma) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (dto.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: dto.permissionIds.map((permissionId: string) => ({ roleId, permissionId }))
        });
      }
    });

    return { data: { success: true, roleId, permissionIds: dto.permissionIds } };
  }
}
