-- CreateTable
CREATE TABLE `MonitoredServer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `host` VARCHAR(191) NOT NULL,
    `serverType` VARCHAR(191) NOT NULL,
    `environment` VARCHAR(191) NOT NULL DEFAULT 'Production',
    `status` VARCHAR(191) NOT NULL DEFAULT 'unknown',
    `responseMs` INTEGER NULL,
    `lastCheckedAt` DATETIME(3) NULL,
    `monitoringEnabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServerHealthCheck` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `serverId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `responseMs` INTEGER NULL,
    `checkedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `details` VARCHAR(191) NULL,

    INDEX `ServerHealthCheck_serverId_checkedAt_idx`(`serverId`, `checkedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServerHealthCheck` ADD CONSTRAINT `ServerHealthCheck_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `MonitoredServer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
