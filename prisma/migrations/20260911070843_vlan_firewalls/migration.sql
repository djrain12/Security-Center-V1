-- AlterTable
ALTER TABLE `NetworkDevice` ADD COLUMN `vlanId` INTEGER NULL,
    ADD COLUMN `zoneName` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `FirewallMonitor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `host` VARCHAR(191) NOT NULL,
    `vendor` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'unknown',
    `responseMs` INTEGER NULL,
    `lastCheckedAt` DATETIME(3) NULL,
    `monitoringEnabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FirewallHealthCheck` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `firewallId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `responseMs` INTEGER NULL,
    `checkedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `details` VARCHAR(191) NULL,

    INDEX `FirewallHealthCheck_firewallId_checkedAt_idx`(`firewallId`, `checkedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FirewallHealthCheck` ADD CONSTRAINT `FirewallHealthCheck_firewallId_fkey` FOREIGN KEY (`firewallId`) REFERENCES `FirewallMonitor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
