-- CreateTable
CREATE TABLE `PfSenseConnection` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Primary pfSense',
    `baseUrl` VARCHAR(191) NOT NULL,
    `encryptedApiKey` VARCHAR(191) NOT NULL,
    `encryptedApiSecret` VARCHAR(191) NOT NULL,
    `statusPath` VARCHAR(191) NOT NULL DEFAULT '/api/v2/status/system',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
