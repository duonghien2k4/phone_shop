ALTER TABLE "product_variants"
ADD COLUMN "purchasePrice" DECIMAL(12, 0);

ALTER TABLE "order_items"
ADD COLUMN "unitCostSnapshot" DECIMAL(12, 0);
