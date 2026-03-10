import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional().default("")
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(64),
  description: z.string().trim().max(255).optional()
});

export const createPermissionSchema = z.object({
  module: z.string().trim().min(2).max(100),
  action: z.string().trim().min(2).max(50),
  description: z.string().trim().max(255).optional()
});

export const listPermissionsSchema = paginationSchema.extend({
  module: z.string().trim().optional().default("")
});

export const assignRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().min(1)).max(500)
});
