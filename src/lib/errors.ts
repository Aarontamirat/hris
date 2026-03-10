import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null
        }
      }
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 422,
      body: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: error.flatten()
        }
      }
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        status: 409,
        body: {
          error: {
            code: "DUPLICATE_RESOURCE",
            message: "A record with the same unique value already exists.",
            details: error.meta ?? null
          }
        }
      };
    }

    return {
      status: 400,
      body: {
        error: {
          code: "DATABASE_REQUEST_ERROR",
          message: "Database request failed.",
          details: error.meta ?? null
        }
      }
    };
  }


  if (error instanceof SyntaxError) {
    return {
      status: 400,
      body: {
        error: {
          code: "INVALID_JSON",
          message: "Malformed JSON payload."
        }
      }
    };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      body: {
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Database connection is not available."
        }
      }
    };
  }

  console.error("Unhandled API error", error);

  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred."
      }
    }
  };
}
