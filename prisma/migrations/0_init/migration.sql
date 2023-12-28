-- CreateTable
CREATE TABLE `certificate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `no` VARCHAR(255) NOT NULL,
    `createdtime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `user_id` INTEGER NOT NULL,
    `employee_id` INTEGER NULL,
    `type` ENUM('SINGLE', 'FAMILY') NOT NULL,
    `insurancetype_id` INTEGER NOT NULL,
    `insurancepackage_id` INTEGER NOT NULL,
    `amount` INTEGER NULL,
    `status` ENUM('PENDING', 'PAID', 'DELETED', 'CANCELLED') NULL DEFAULT 'PENDING',
    `servicelocation_id` INTEGER NULL,
    `buy_mode` VARCHAR(20) NULL DEFAULT 'app',
    `expirytime` DATETIME(0) NULL,

    UNIQUE INDEX `no_UNIQUE`(`no`),
    INDEX `certificate_createdtime_index`(`createdtime`),
    INDEX `certificate_insurancepackage_id_fk`(`insurancepackage_id`),
    INDEX `certificate_insurancetype_id_fk`(`insurancetype_id`),
    INDEX `certificate_servicelocation_id_fk`(`servicelocation_id`),
    INDEX `fk_certificate_user1_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificatemember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(100) NULL,
    `email` VARCHAR(100) NULL,
    `relation` ENUM('HEAD', 'COUPLE', 'CHILDREN', 'PARENTS', 'FRIENDS', 'OTHER') NOT NULL,
    `certificate_id` INTEGER NOT NULL,
    `dob` DATE NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `photo` JSON NULL,
    `passport` VARCHAR(200) NULL,
    `countrycode` VARCHAR(30) NULL,
    `province_id` INTEGER NULL,
    `workplace` VARCHAR(1000) NULL,
    `seq` VARCHAR(3) NULL,

    INDEX `certificatemember_province_id_fk`(`province_id`),
    INDEX `fk_certificatemember_certificate1_idx`(`certificate_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificatesequence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `seq` INTEGER NOT NULL DEFAULT 1,
    `createdtime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `claim` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reqtime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` ENUM('WAITING', 'PROCESSING', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED', 'COMPLETED', 'CLOSED') NOT NULL DEFAULT 'WAITING',
    `lastupdate` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `certificate_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,
    `employee_id` INTEGER NULL,
    `type` VARCHAR(200) NULL,
    `amount` INTEGER NULL,
    `hospital_id` INTEGER NULL,
    `photo` JSON NULL,
    `approveddate` TIMESTAMP(0) NULL,
    `approvedby` INTEGER NULL,
    `certificatemember_id` INTEGER NULL,
    `claim_mode` VARCHAR(20) NULL DEFAULT 'app',

    INDEX `claim_certificatemember_id_fk`(`certificatemember_id`),
    INDEX `claim_hospital_id_fk`(`hospital_id`),
    INDEX `fk_claim_certificate1_idx`(`certificate_id`),
    INDEX `fk_claim_employee1_idx`(`employee_id`),
    INDEX `fk_claim_user1_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `claimlog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `txtime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` ENUM('WAITING', 'PROCESSING', 'APPROVED', 'REJECTED', 'PAID', 'COMMENT', 'CANCELLED', 'COMPLETED', 'CLOSED', 'UPDATE') NOT NULL DEFAULT 'WAITING',
    `remark` TEXT NULL,
    `claim_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `request_body` JSON NULL,

    INDEX `claimlog_user_id_fk`(`user_id`),
    INDEX `fk_claimlog_claim1_idx`(`claim_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `iso` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `nicename` VARCHAR(255) NOT NULL,
    `iso3` CHAR(3) NULL,
    `numcode` SMALLINT NULL,
    `phonecode` INTEGER NOT NULL,

    UNIQUE INDEX `country_code_uindex`(`iso`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `district` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `province_id` INTEGER NOT NULL,

    INDEX `fk_district_province1_idx`(`province_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `firstname` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN') NOT NULL,

    UNIQUE INDEX `username_UNIQUE`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exchangerate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(0) NOT NULL,
    `lak` DECIMAL(10, 2) NULL,
    `thb` DECIMAL(10, 2) NULL,
    `usd` DECIMAL(10, 2) NULL,
    `cny` DECIMAL(10, 2) NULL,
    `employee_id` INTEGER NOT NULL,

    INDEX `fk_exchangerate_employee1_idx`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hospital` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `tel` VARCHAR(255) NOT NULL,
    `hospitaltype` VARCHAR(200) NOT NULL,
    `employee_id` INTEGER NOT NULL,
    `lat` VARCHAR(255) NOT NULL,
    `lng` VARCHAR(255) NOT NULL,
    `images` JSON NOT NULL,
    `deleted` BOOLEAN NULL DEFAULT false,

    INDEX `fk_hospital_employee1_idx`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imageslide` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` JSON NOT NULL,
    `url` TEXT NOT NULL,
    `image` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insurancepackage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(1000) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(255) NOT NULL,
    `lastupdate` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `employee_id` INTEGER NOT NULL,
    `terms` TEXT NOT NULL,
    `status` ENUM('ACTIVE', 'HIDDEN') NOT NULL DEFAULT 'ACTIVE',
    `orderno` VARCHAR(100) NULL,
    `insurancetype_id` INTEGER NULL,
    `period` INTEGER NULL DEFAULT 0,

    INDEX `fk_package_employee1_idx`(`employee_id`),
    INDEX `insurancepackage_insurancetype_id_fk`(`insurancetype_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insurancetype` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(1000) NOT NULL,
    `photo` VARCHAR(1000) NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('ACTIVE', 'HIDDEN') NOT NULL DEFAULT 'ACTIVE',
    `orderno` VARCHAR(100) NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `language` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` JSON NULL,

    UNIQUE INDEX `language_code_uindex`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` JSON NOT NULL,
    `icon` TEXT NOT NULL,
    `iswebview` TINYINT NOT NULL DEFAULT 0,
    `url` TEXT NULL,
    `status` ENUM('ACTIVE', 'HIDDEN', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `position` INTEGER NULL,
    `platform` ENUM('APP', 'WEB') NOT NULL DEFAULT 'APP',
    `islogin` BOOLEAN NULL DEFAULT true,
    `params` JSON NULL,
    `role` ENUM('USER', 'STAFF') NULL DEFAULT 'USER',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` VARCHAR(255) NOT NULL,
    `createdtime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(255) NULL,
    `code` VARCHAR(255) NOT NULL,
    `lastsent` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `email` VARCHAR(200) NULL,
    `type` ENUM('email', 'phone') NOT NULL DEFAULT 'email',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdtime` DATETIME(0) NOT NULL,
    `certificate_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `channel` VARCHAR(255) NULL,
    `ref` VARCHAR(255) NULL,
    `rawresponse` JSON NULL,
    `employee_id` INTEGER NULL,

    INDEX `fk_payment_certificate1_idx`(`certificate_id`),
    INDEX `fk_payment_user1_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `province` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purpose` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` JSON NOT NULL,
    `deleted` TINYINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `repayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `txtime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `amount` DECIMAL(10, 2) NOT NULL,
    `ccy` ENUM('LAK', 'USD', 'THB', 'CNY') NOT NULL,
    `ref` VARCHAR(255) NOT NULL,
    `channel` ENUM('ACCOUNT', 'WALLET', 'CASH') NOT NULL,
    `remark` TEXT NULL,
    `user_id` INTEGER NOT NULL,
    `claim_id` INTEGER NOT NULL,
    `employee_id` INTEGER NOT NULL,
    `certificate_id` INTEGER NOT NULL,

    INDEX `fk_repayment_certificate1_idx`(`certificate_id`),
    INDEX `fk_repayment_claim1_idx`(`claim_id`),
    INDEX `fk_repayment_employee1_idx`(`employee_id`),
    INDEX `fk_repayment_user1_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `role` VARCHAR(30) NOT NULL,
    `name` VARCHAR(100) NULL,
    `details` TEXT NULL,
    `isactive` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `role_role_uindex`(`role`),
    PRIMARY KEY (`role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicelocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `tel` VARCHAR(255) NOT NULL,
    `lat` VARCHAR(255) NOT NULL,
    `lng` VARCHAR(255) NOT NULL,
    `images` JSON NULL,
    `deleted` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `value` JSON NOT NULL,

    UNIQUE INDEX `settings_name_uindex`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sos_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `staffId` INTEGER NOT NULL,
    `lat` DOUBLE NULL,
    `lng` DOUBLE NULL,
    `acc` DOUBLE NULL,
    `status` ENUM('PENDING', 'INPROGRESS', 'COMPLETED', 'CANCELED') NULL,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `staffId`(`staffId`),
    INDEX `ticketId`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sos_messages` (
    `messageId` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `senderId` INTEGER NOT NULL,
    `receiverId` INTEGER NOT NULL,
    `message` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `isRead` BOOLEAN NULL DEFAULT false,
    `image` VARCHAR(255) NULL,
    `lat` DOUBLE NULL,
    `lng` DOUBLE NULL,
    `message_type` ENUM('TEXT', 'FILE', 'LOCATION', 'LIVE_LOCATION') NULL DEFAULT 'TEXT',

    INDEX `receiverId`(`receiverId`),
    INDEX `senderId`(`senderId`),
    INDEX `ticketId`(`ticketId`),
    PRIMARY KEY (`messageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sos_tickets` (
    `ticketId` INTEGER NOT NULL AUTO_INCREMENT,
    `requesterId` INTEGER NOT NULL,
    `accepterId` INTEGER NULL,
    `lat` DOUBLE NULL,
    `lng` DOUBLE NULL,
    `acc` DOUBLE NULL,
    `status` ENUM('PENDING', 'INPROGRESS', 'COMPLETED', 'CANCELED') NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `description` VARCHAR(255) NULL,

    INDEX `requesterId`(`requesterId`),
    INDEX `sos_tickets_ibfk_2_idx`(`accepterId`),
    PRIMARY KEY (`ticketId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `translation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word` VARCHAR(200) NOT NULL,
    `route` VARCHAR(200) NULL,
    `translate` JSON NOT NULL,

    UNIQUE INDEX `translation_word_uindex`(`word`),
    UNIQUE INDEX `translation_word_route_uindex`(`word`, `route`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(255) NULL,
    `password` VARCHAR(255) NOT NULL,
    `firstname` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `registerdate` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `photo` LONGTEXT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL DEFAULT 'MALE',
    `passport` VARCHAR(255) NULL,
    `visatype_id` INTEGER NULL,
    `status` ENUM('LOCKED', 'ACTIVE', 'CLOSED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `dob` DATE NOT NULL,
    `email` VARCHAR(255) NULL,
    `province_id` INTEGER NULL,
    `token` VARCHAR(255) NULL,
    `idtype` ENUM('PASSPORT', 'ID', 'VACCINE', 'OTHERS') NOT NULL,
    `role` ENUM('USER', 'ADMIN', 'STAFF', 'SELLER', 'CLAIMER', 'ACCOUNTING') NOT NULL DEFAULT 'USER',
    `purposeofvisit` ENUM('WORK30', 'WORK', 'TOUR') NOT NULL DEFAULT 'TOUR',
    `resident` VARCHAR(1000) NULL,
    `workplace` VARCHAR(1000) NULL,
    `street` VARCHAR(1000) NULL,
    `city` VARCHAR(1000) NULL,
    `address` VARCHAR(1000) NULL,
    `countrycode` VARCHAR(100) NULL,
    `position` VARCHAR(30) NULL,
    `hospital_id` INTEGER NULL,
    `servicelocation_id` INTEGER NULL,
    `firebasetoken` VARCHAR(1000) NULL,
    `register_mode` VARCHAR(20) NULL,
    `employee_id` INTEGER NULL,

    UNIQUE INDEX `user_phone_uindex`(`phone`),
    UNIQUE INDEX `user_email_uindex`(`email`),
    INDEX `fk_user_province1_idx`(`province_id`),
    INDEX `user_hospital_id_fk_idx`(`hospital_id`),
    INDEX `user_servicelocation_id_index`(`servicelocation_id`),
    INDEX `user_user_id_fk`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `messageId` INTEGER NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `messageId`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userid` INTEGER NOT NULL,
    `senttime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `lat` VARCHAR(200) NOT NULL,
    `lng` VARCHAR(200) NOT NULL,
    `acc` VARCHAR(200) NULL,
    `message` TEXT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',

    INDEX `sos_user_id_fk`(`userid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `soslog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `txtime` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `userid` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED') NOT NULL,
    `remark` TEXT NULL,
    `photo` JSON NULL,
    `sosid` INTEGER NULL,

    INDEX `soslog_sos_id_fk`(`sosid`),
    INDEX `soslog_user_id_fk`(`userid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `certificate` ADD CONSTRAINT `certificate_insurancepackage_id_fk` FOREIGN KEY (`insurancepackage_id`) REFERENCES `insurancepackage`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `certificate` ADD CONSTRAINT `certificate_insurancetype_id_fk` FOREIGN KEY (`insurancetype_id`) REFERENCES `insurancetype`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `certificate` ADD CONSTRAINT `certificate_servicelocation_id_fk` FOREIGN KEY (`servicelocation_id`) REFERENCES `servicelocation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `certificate` ADD CONSTRAINT `fk_certificate_user1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `certificatemember` ADD CONSTRAINT `certificatemember_province_id_fk` FOREIGN KEY (`province_id`) REFERENCES `province`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `certificatemember` ADD CONSTRAINT `fk_certificatemember_certificate1` FOREIGN KEY (`certificate_id`) REFERENCES `certificate`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `claim` ADD CONSTRAINT `claim_certificatemember_id_fk` FOREIGN KEY (`certificatemember_id`) REFERENCES `certificatemember`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `claim` ADD CONSTRAINT `claim_hospital_id_fk` FOREIGN KEY (`hospital_id`) REFERENCES `hospital`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `claim` ADD CONSTRAINT `fk_claim_certificate1` FOREIGN KEY (`certificate_id`) REFERENCES `certificate`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `claim` ADD CONSTRAINT `fk_claim_user1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `claimlog` ADD CONSTRAINT `claimlog_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `claimlog` ADD CONSTRAINT `fk_claimlog_claim1` FOREIGN KEY (`claim_id`) REFERENCES `claim`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `district` ADD CONSTRAINT `fk_district_province1` FOREIGN KEY (`province_id`) REFERENCES `province`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `exchangerate` ADD CONSTRAINT `fk_exchangerate_employee1` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `hospital` ADD CONSTRAINT `fk_hospital_employee1` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `insurancepackage` ADD CONSTRAINT `fk_package_employee1` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `insurancepackage` ADD CONSTRAINT `insurancepackage_insurancetype_id_fk` FOREIGN KEY (`insurancetype_id`) REFERENCES `insurancetype`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `fk_payment_certificate1` FOREIGN KEY (`certificate_id`) REFERENCES `certificate`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `fk_payment_user1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `repayment` ADD CONSTRAINT `fk_repayment_certificate1` FOREIGN KEY (`certificate_id`) REFERENCES `certificate`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `repayment` ADD CONSTRAINT `fk_repayment_claim1` FOREIGN KEY (`claim_id`) REFERENCES `claim`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `repayment` ADD CONSTRAINT `fk_repayment_employee1` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `repayment` ADD CONSTRAINT `fk_repayment_user1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos_info` ADD CONSTRAINT `sos_info_ibfk_1` FOREIGN KEY (`ticketId`) REFERENCES `sos_tickets`(`ticketId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos_info` ADD CONSTRAINT `sos_info_ibfk_2` FOREIGN KEY (`staffId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos_messages` ADD CONSTRAINT `sos_messages_ibfk_1` FOREIGN KEY (`ticketId`) REFERENCES `sos_tickets`(`ticketId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos_messages` ADD CONSTRAINT `sos_messages_ibfk_2` FOREIGN KEY (`senderId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos_messages` ADD CONSTRAINT `sos_messages_ibfk_3` FOREIGN KEY (`receiverId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos_tickets` ADD CONSTRAINT `sos_tickets_ibfk_1` FOREIGN KEY (`requesterId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos_tickets` ADD CONSTRAINT `sos_tickets_ibfk_2` FOREIGN KEY (`accepterId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `fk_user_province1` FOREIGN KEY (`province_id`) REFERENCES `province`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_hospital_id_fk` FOREIGN KEY (`hospital_id`) REFERENCES `hospital`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_servicelocation_id_fk` FOREIGN KEY (`servicelocation_id`) REFERENCES `servicelocation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_user_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `location_log` ADD CONSTRAINT `location_log_ibfk_1` FOREIGN KEY (`messageId`) REFERENCES `sos_messages`(`messageId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sos` ADD CONSTRAINT `sos_user_id_fk` FOREIGN KEY (`userid`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `soslog` ADD CONSTRAINT `soslog_sos_id_fk` FOREIGN KEY (`sosid`) REFERENCES `sos`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `soslog` ADD CONSTRAINT `soslog_user_id_fk` FOREIGN KEY (`userid`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

