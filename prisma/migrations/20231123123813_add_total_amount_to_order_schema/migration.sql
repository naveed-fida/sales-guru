/*
  Warnings:

  - Added the required column `totalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `amountDue` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `pricePerUnit` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "totalAmount" INTEGER NOT NULL,
ALTER COLUMN "amountDue" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderProduct" ADD COLUMN     "pricePerUnit" DOUBLE PRECISION NOT NULL;
