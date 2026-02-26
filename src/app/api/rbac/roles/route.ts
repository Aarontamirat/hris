import { NextRequest } from "next/server";

import { withErrorHandling } from "@/lib/api-handler";
import { requirePermission } from "@/lib/rbac";
import { RbacService } from "@/services/rbac/rbac.service";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requirePermission("RBAC:READ");
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    return RbacService.listRoles(params);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requirePermission("RBAC:MANAGE");
    const payload = await request.json();
    return RbacService.createRole(payload);
  });
}
