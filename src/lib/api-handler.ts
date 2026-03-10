import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/errors";

export async function withErrorHandling<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    return NextResponse.json(data);
  } catch (error) {
    const mapped = toErrorResponse(error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
