/*
  Warnings:

  - You are about to drop the column `image_url` on the `menus` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[image_name]` on the table `menus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image_name` to the `menus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "menus" DROP COLUMN "image_url",
ADD COLUMN     "image_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "menus_image_name_key" ON "menus"("image_name");
