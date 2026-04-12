/*
  Warnings:

  - You are about to drop the column `deleted` on the `refresh_tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "deleted",
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false;
