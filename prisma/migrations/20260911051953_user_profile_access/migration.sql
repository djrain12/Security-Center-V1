-- AlterTable
ALTER TABLE `User` ADD COLUMN `accessLevel` ENUM('MASTER_ADMIN', 'ADMIN', 'IT_SECURITY_OFFICER', 'IT_USER') NOT NULL DEFAULT 'IT_USER',
    ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `birthday` DATETIME(3) NULL,
    ADD COLUMN `contactNumber` VARCHAR(191) NULL,
    ADD COLUMN `photoUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `UserModulePermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `moduleName` VARCHAR(191) NOT NULL,
    `allowed` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserModulePermission_userId_moduleName_key`(`userId`, `moduleName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserModulePermission` ADD CONSTRAINT `UserModulePermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
