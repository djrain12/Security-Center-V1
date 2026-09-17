-- AlterTable
ALTER TABLE `User` ADD COLUMN `mfaEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `passwordHash` VARCHAR(191) NULL;
