/*
  Warnings:

  - Added the required column `visatype_id` to the `certificatemember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `certificatemember` ADD COLUMN `visatype_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `visatype` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `certificatemember` ADD CONSTRAINT `cmember_visatype_id_fk` FOREIGN KEY (`visatype_id`) REFERENCES `visatype`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_visatype_id_fk` FOREIGN KEY (`visatype_id`) REFERENCES `visatype`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
