/*
  Warnings:

  - You are about to drop the column `avi_rule` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "avi_rule",
ADD COLUMN     "avi_url" TEXT;
