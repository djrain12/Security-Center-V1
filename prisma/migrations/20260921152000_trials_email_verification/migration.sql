ALTER TABLE `Company` ADD COLUMN `subscriptionStatus` VARCHAR(191) NOT NULL DEFAULT 'TRIAL',
  ADD COLUMN `subscriptionEndsAt` DATETIME(3) NULL;
ALTER TABLE `User` ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL;
UPDATE `User` SET `emailVerifiedAt` = CURRENT_TIMESTAMP(3) WHERE `status` = 'ACTIVE';
CREATE TABLE `EmailVerificationToken` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `userId` INTEGER NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `EmailVerificationToken_tokenHash_key`(`tokenHash`),
  INDEX `EmailVerificationToken_userId_expiresAt_idx`(`userId`, `expiresAt`),
  CONSTRAINT `EmailVerificationToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
