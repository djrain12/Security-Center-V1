-- CreateTable
CREATE TABLE `NetworkDevice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ipAddress` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `macAddress` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'unknown',
    `responseMs` INTEGER NULL,
    `lastScannedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `NetworkDevice_ipAddress_key`(`ipAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
