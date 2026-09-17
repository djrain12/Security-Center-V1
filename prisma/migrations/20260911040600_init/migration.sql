-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `canViewConfidential` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SecurityAsset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assetTag` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `assetType` ENUM('SERVER', 'ENDPOINT', 'NETWORK', 'APPLICATION', 'CLOUD') NOT NULL,
    `ownerDepartment` VARCHAR(191) NOT NULL,
    `criticality` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL,
    `protectionStatus` VARCHAR(191) NOT NULL DEFAULT 'protected',
    `lastAssessedAt` DATETIME(3) NULL,

    UNIQUE INDEX `SecurityAsset_assetTag_key`(`assetTag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SecurityIncident` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `incidentCode` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL,
    `status` ENUM('OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    `assignedTo` INTEGER NULL,
    `affectedAssetId` INTEGER NULL,
    `detectedAt` DATETIME(3) NOT NULL,
    `resolvedAt` DATETIME(3) NULL,

    UNIQUE INDEX `SecurityIncident_incidentCode_key`(`incidentCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vulnerability` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cveId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'MITIGATED', 'ACCEPTED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `assetId` INTEGER NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `ownerId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Risk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `riskCode` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `rating` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL,
    `status` ENUM('OPEN', 'TREATING', 'ACCEPTED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `ownerId` INTEGER NULL,
    `treatmentDue` DATETIME(3) NULL,

    UNIQUE INDEX `Risk_riskCode_key`(`riskCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ComplianceFramework` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `readinessPercent` DECIMAL(5, 2) NOT NULL,
    `nextReviewDate` DATETIME(3) NULL,

    UNIQUE INDEX `ComplianceFramework_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SecurityActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `completionPercent` INTEGER NOT NULL,
    `ownerId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CorrectiveAction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `sourceType` VARCHAR(191) NOT NULL,
    `sourceId` INTEGER NOT NULL,
    `ownerId` INTEGER NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETE') NOT NULL DEFAULT 'OPEN',
    `dueDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `actorId` INTEGER NULL,
    `action` VARCHAR(191) NOT NULL,
    `resourceType` VARCHAR(191) NOT NULL,
    `resourceId` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SecurityIncident` ADD CONSTRAINT `SecurityIncident_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SecurityIncident` ADD CONSTRAINT `SecurityIncident_affectedAssetId_fkey` FOREIGN KEY (`affectedAssetId`) REFERENCES `SecurityAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vulnerability` ADD CONSTRAINT `Vulnerability_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `SecurityAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vulnerability` ADD CONSTRAINT `Vulnerability_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Risk` ADD CONSTRAINT `Risk_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SecurityActivity` ADD CONSTRAINT `SecurityActivity_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CorrectiveAction` ADD CONSTRAINT `CorrectiveAction_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
