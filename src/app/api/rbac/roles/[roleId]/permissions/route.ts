import { NextRequest } from "next/server";

import { withErrorHandling } from "@/lib/api-handler";
import { requirePermission } from "@/lib/rbac";
import { RbacService } from "@/services/rbac/rbac.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ roleId: string }> }) {
  return withErrorHandling(async () => {
    await requirePermission("RBAC:MANAGE");
    const { roleId } = await params;
    const payload = await request.json();
    return RbacService.setRolePermissions(roleId, payload);
  });
}
