-- CreateTable
CREATE TABLE `TrafficLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sourceIp` VARCHAR(191) NULL,
    `destinationIp` VARCHAR(191) NULL,
    `destinationPort` INTEGER NULL,
    `protocol` VARCHAR(191) NULL,
    `action` VARCHAR(191) NULL,
    `interfaceName` VARCHAR(191) NULL,
    `rawMessage` VARCHAR(191) NOT NULL,
    `loggedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TrafficLog_sourceIp_loggedAt_idx`(`sourceIp`, `loggedAt`),
    INDEX `TrafficLog_loggedAt_idx`(`loggedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
