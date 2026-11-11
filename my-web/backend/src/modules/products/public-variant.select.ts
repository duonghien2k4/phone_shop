import { Prisma } from '@prisma/client';

export const publicVariantSelect = {
  id: true,
  productId: true,
  color: true,
  storage: true,
  ram: true,
  sku: true,
  price: true,
  oldPrice: true,
  imageUrl: true,
  inventory: true,
} satisfies Prisma.ProductVariantSelect;
