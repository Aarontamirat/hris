-- CreateTable
CREATE TABLE `Role` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `description` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `deletedAt` DATETIME(3) NULL,
  UNIQUE INDEX `Role_name_key`(`name`),
  INDEX `Role_deletedAt_idx`(`deletedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `firstName` VARCHAR(100) NOT NULL,
  `lastName` VARCHAR(100) NOT NULL,
  `status` ENUM('ACTIVE', 'SUSPENDED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  `roleId` VARCHAR(191) NULL,
  `failedLoginAttempts` INTEGER NOT NULL DEFAULT 0,
  `lockedUntil` DATETIME(3) NULL,
  `lastLoginAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `deletedAt` DATETIME(3) NULL,
  UNIQUE INDEX `User_email_key`(`email`),
  INDEX `User_roleId_idx`(`roleId`),
  INDEX `User_status_idx`(`status`),
  INDEX `User_deletedAt_idx`(`deletedAt`),
  INDEX `User_lockedUntil_idx`(`lockedUntil`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(255) NOT NULL,
  `ipAddress` VARCHAR(64) NULL,
  `userAgent` VARCHAR(255) NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `revokedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `deletedAt` DATETIME(3) NULL,
  UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
  INDEX `Session_userId_idx`(`userId`),
  INDEX `Session_expiresAt_idx`(`expiresAt`),
  INDEX `Session_revokedAt_idx`(`revokedAt`),
  INDEX `Session_deletedAt_idx`(`deletedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
  `id` VARCHAR(191) NOT NULL,
  `actorUserId` VARCHAR(191) NULL,
  `module` VARCHAR(100) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `entity` VARCHAR(100) NOT NULL,
  `entityId` VARCHAR(100) NULL,
  `ipAddress` VARCHAR(64) NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `AuditLog_actorUserId_createdAt_idx`(`actorUserId`, `createdAt`),
  INDEX `AuditLog_module_action_idx`(`module`, `action`),
  INDEX `AuditLog_entity_entityId_idx`(`entity`, `entityId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
