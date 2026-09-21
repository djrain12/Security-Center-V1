CREATE TABLE `RecordEditRequest` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `recordId` VARCHAR(191) NOT NULL,
  `module` VARCHAR(191) NOT NULL,
  `requestedById` INTEGER NOT NULL,
  `reviewedById` INTEGER NULL,
  `reason` TEXT NOT NULL,
  `changes` JSON NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reviewedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  INDEX `RecordEditRequest_module_recordId_status_idx`(`module`, `recordId`, `status`),
  INDEX `RecordEditRequest_requestedById_status_idx`(`requestedById`, `status`),
  CONSTRAINT `RecordEditRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `RecordEditRequest_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
