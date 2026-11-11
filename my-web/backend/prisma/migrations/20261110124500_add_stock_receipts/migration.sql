CREATE TABLE "stock_receipts" (
    "id" SERIAL NOT NULL,
    "supplier" TEXT,
    "billImageUrl" TEXT,
    "ocrText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "stock_receipts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stock_receipt_items" (
    "id" SERIAL NOT NULL,
    "receiptId" INTEGER NOT NULL,
    "variantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(12,0) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_receipt_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stock_receipt_items_receiptId_variantId_key"
ON "stock_receipt_items"("receiptId", "variantId");

ALTER TABLE "stock_receipt_items"
ADD CONSTRAINT "stock_receipt_items_receiptId_fkey"
FOREIGN KEY ("receiptId") REFERENCES "stock_receipts"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "stock_receipt_items"
ADD CONSTRAINT "stock_receipt_items_variantId_fkey"
FOREIGN KEY ("variantId") REFERENCES "product_variants"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
