/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Area` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");
