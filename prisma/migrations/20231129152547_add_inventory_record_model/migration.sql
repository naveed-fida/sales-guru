-- CreateTable
CREATE TABLE "InventroyRecord" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventroyRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InventroyRecord" ADD CONSTRAINT "InventroyRecord_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
