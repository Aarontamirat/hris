import { withErrorHandling } from "@/lib/api-handler";
import { getAuthenticatedUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }

    return {
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name ?? null,
        status: user.status
      }
    };
  });
}
