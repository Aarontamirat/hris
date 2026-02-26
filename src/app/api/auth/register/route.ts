import { NextRequest } from "next/server";

import { withErrorHandling } from "@/lib/api-handler";
import { requestContext } from "@/lib/request";
import { AuthService } from "@/services/auth/auth.service";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const payload = await request.json();
    return AuthService.register(payload, requestContext(request));
  });
}
