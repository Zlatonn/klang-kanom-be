/*
  Warnings:

  - The values [PO,PM] on the enum `Position` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Position_new" AS ENUM ('CEO', 'CTO', 'HR', 'ADMIN', 'FINANCE', 'MARKETING', 'SALES', 'BA', 'SA', 'UXUI', 'DEV', 'DEVOPS', 'QA', 'RND', 'SERVICE', 'INTERN');
ALTER TABLE "users" ALTER COLUMN "position" TYPE "Position_new" USING ("position"::text::"Position_new");
ALTER TYPE "Position" RENAME TO "Position_old";
ALTER TYPE "Position_new" RENAME TO "Position";
DROP TYPE "Position_old";
COMMIT;
