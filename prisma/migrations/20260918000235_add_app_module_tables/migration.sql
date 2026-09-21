-- CreateTable
CREATE TABLE `ModuleRecord` (
    `id` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NOT NULL DEFAULT 'Info',
    `meta` VARCHAR(191) NOT NULL DEFAULT '',
    `detail` TEXT NOT NULL,
    `attachmentName` VARCHAR(191) NULL,
    `attachmentType` VARCHAR(191) NULL,
    `attachmentData` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ModuleRecord_module_idx`(`module`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryDevice` (
    `id` VARCHAR(191) NOT NULL,
    `assetTag` VARCHAR(191) NOT NULL,
    `deviceType` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `serialNumber` VARCHAR(191) NOT NULL DEFAULT '',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Good',
    `deployed` BOOLEAN NOT NULL DEFAULT false,
    `assignedTo` VARCHAR(191) NOT NULL DEFAULT '',

    UNIQUE INDEX `InventoryDevice_assetTag_key`(`assetTag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BackupJob` (
    `id` VARCHAR(191) NOT NULL,
    `jobName` VARCHAR(191) NOT NULL,
    `backupType` VARCHAR(191) NOT NULL DEFAULT 'Full',
    `schedule` VARCHAR(191) NOT NULL DEFAULT '',
    `target` VARCHAR(191) NOT NULL DEFAULT '',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Healthy',
    `lastRun` VARCHAR(191) NOT NULL DEFAULT '',
    `retention` VARCHAR(191) NOT NULL DEFAULT '30 days',
    `attachmentName` VARCHAR(191) NULL,
    `attachmentData` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LibraryDocument` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'Policy',
    `framework` VARCHAR(191) NOT NULL DEFAULT 'General',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `size` VARCHAR(191) NOT NULL DEFAULT '—',
    `uploadedAt` VARCHAR(191) NOT NULL DEFAULT '',
    `dataUrl` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailAccount` (
    `id` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL DEFAULT '',
    `employeeName` VARCHAR(191) NOT NULL,
    `verifyName` VARCHAR(191) NOT NULL DEFAULT '',
    `userType` VARCHAR(191) NOT NULL DEFAULT 'New',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `personalEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `personalPassword` VARCHAR(191) NOT NULL DEFAULT '',
    `wsiEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `wsiPassword` VARCHAR(191) NOT NULL DEFAULT '',
    `company` VARCHAR(191) NOT NULL DEFAULT '',
    `remarks` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyReportEntry` (
    `id` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `employeeName` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL DEFAULT '',
    `timeIn` VARCHAR(191) NOT NULL DEFAULT '',
    `timeOut` VARCHAR(191) NOT NULL DEFAULT '',
    `tasks` TEXT NOT NULL,
    `accomplishments` TEXT NULL,
    `issues` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Submitted',
    `attachmentName` VARCHAR(191) NULL,
    `attachmentData` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CctvDevice` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL DEFAULT '',
    `ipAddress` VARCHAR(191) NOT NULL DEFAULT '',
    `model` VARCHAR(191) NOT NULL DEFAULT '',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Online',
    `lastService` VARCHAR(191) NOT NULL DEFAULT '',
    `streamUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `username` VARCHAR(191) NOT NULL DEFAULT '',
    `password` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatRoom` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isGroup` BOOLEAN NOT NULL DEFAULT false,
    `members` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `id` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `senderName` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `fileName` VARCHAR(191) NULL,
    `fileType` VARCHAR(191) NULL,
    `fileData` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ChatMessage_roomId_idx`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppSetting` (
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
