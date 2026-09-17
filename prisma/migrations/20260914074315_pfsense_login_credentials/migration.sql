-- AlterTable
ALTER TABLE `PfSenseConnection` ADD COLUMN `encryptedPassword` VARCHAR(191) NULL,
    ADD COLUMN `encryptedUsername` VARCHAR(191) NULL;
