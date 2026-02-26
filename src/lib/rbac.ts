import { AppError } from "@/lib/errors";

export function ensureRole(userRole: string | undefined, allowedRoles: string[]) {
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }
}
