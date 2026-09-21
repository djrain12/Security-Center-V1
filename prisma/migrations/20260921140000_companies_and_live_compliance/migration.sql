CREATE TABLE `Company` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Company_slug_key`(`slug`),
  INDEX `Company_name_idx`(`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `User` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `ComplianceFramework` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `LibraryDocument` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `ComplianceFramework` DROP INDEX `ComplianceFramework_name_key`;
CREATE UNIQUE INDEX `ComplianceFramework_companyId_name_key` ON `ComplianceFramework`(`companyId`, `name`);
ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ComplianceFramework` ADD CONSTRAINT `ComplianceFramework_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `LibraryDocument` ADD CONSTRAINT `LibraryDocument_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE `LibraryDocument` SET `companyId` = (SELECT `id` FROM `Company` WHERE `slug` = 'wsi' LIMIT 1) WHERE `companyId` IS NULL;
DELETE old_framework FROM `ComplianceFramework` old_framework
INNER JOIN `ComplianceFramework` company_framework
  ON company_framework.`name` = old_framework.`name`
  AND company_framework.`companyId` = (SELECT `id` FROM `Company` WHERE `slug` = 'wsi' LIMIT 1)
WHERE old_framework.`companyId` IS NULL;
UPDATE `ComplianceFramework` SET `companyId` = (SELECT `id` FROM `Company` WHERE `slug` = 'wsi' LIMIT 1) WHERE `companyId` IS NULL;
