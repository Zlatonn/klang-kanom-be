/*
  Warnings:

  - A unique constraint covering the columns `[image_name]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `position` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Position" AS ENUM ('CEO', 'CTO', 'HR', 'ADMIN', 'FINANCE', 'MARKETING', 'SALES', 'PO', 'PM', 'BA', 'SA', 'UXUI', 'DEV', 'DEVOPS', 'QA', 'RND', 'SERVICE', 'INTERN');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "image_name" TEXT,
ADD COLUMN     "position" "public"."Position" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_image_name_key" ON "public"."users"("image_name");
