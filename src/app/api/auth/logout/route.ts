import { withErrorHandling } from "@/lib/api-handler";
import { revokeCurrentSession } from "@/lib/auth";

export async function POST() {
  return withErrorHandling(async () => {
    await revokeCurrentSession();
    return { data: { success: true } };
  });
}
