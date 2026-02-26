import { UserStatus } from "@prisma/client";

import { createSession, verifyPassword, hashPassword } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/schemas/auth";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const DEFAULT_ROLE = "EMPLOYEE";

export class AuthService {
  static async register(payload: unknown, context: { ipAddress?: string; userAgent?: string }) {
    const dto = registerSchema.parse(payload);

    const exists = await prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null }
    });
    if (exists) {
      throw new AppError("Email already exists", 409, "EMAIL_ALREADY_EXISTS");
    }

    const role = await prisma.role.upsert({
      where: { name: DEFAULT_ROLE },
      update: {},
      create: { name: DEFAULT_ROLE, description: "Default employee role" }
    });

    const created = await prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash: await hashPassword(dto.password),
        roleId: role.id
      },
      include: { role: true }
    });

    await auditLog({
      actorUserId: created.id,
      module: "AUTH",
      action: "REGISTER",
      entity: "User",
      entityId: created.id,
      ipAddress: context.ipAddress,
      metadata: { email: created.email }
    });

    await createSession(created.id, context);

    return {
      data: {
        id: created.id,
        email: created.email,
        firstName: created.firstName,
        lastName: created.lastName,
        role: created.role?.name ?? null,
        status: created.status
      }
    };
  }

  static async login(payload: unknown, context: { ipAddress?: string; userAgent?: string }) {
    const dto = loginSchema.parse(payload);

    const user = await prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      include: { role: true }
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError("Account is not active", 403, "ACCOUNT_INACTIVE");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError("Account is locked. Try again later", 423, "ACCOUNT_LOCKED");
    }

    const validPassword = await verifyPassword(dto.password, user.passwordHash);
    if (!validPassword) {
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null
        }
      });

      await auditLog({
        actorUserId: user.id,
        module: "AUTH",
        action: "LOGIN_FAILED",
        entity: "User",
        entityId: user.id,
        ipAddress: context.ipAddress,
        metadata: { attempts }
      });

      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date()
        }
      }),
      prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null, deletedAt: null },
        data: { revokedAt: new Date() }
      })
    ]);

    await createSession(user.id, context);

    await auditLog({
      actorUserId: user.id,
      module: "AUTH",
      action: "LOGIN_SUCCESS",
      entity: "User",
      entityId: user.id,
      ipAddress: context.ipAddress
    });

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
  }
}
