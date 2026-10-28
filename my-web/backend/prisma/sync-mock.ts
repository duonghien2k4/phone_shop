import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function syncMock() {
  console.log('=== DONG BO DU LIEU DATABASE POSTGRESQL VAO MOCK-PRODUCTS.TS ===');

  const products = await prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      variants: {
        orderBy: { price: 'asc' },
      },
    },
    orderBy: { id: 'asc' },
  });

  console.log(`Tim thay ${products.length} san pham trong DB voi tong cong ${products.reduce((acc, p) => acc + p.variants.length, 0)} variants.`);

  const mockProducts = products.map((p) => {
    const brandName = p.brand?.name || 'Khác';
    const categoryName = p.category?.name || 'Điện thoại';
    const firstVariant = p.variants[0];
    const baseSalePrice = Number(p.salePrice || firstVariant?.price || p.basePrice || 0);
    const baseOldPrice = Number(p.basePrice || (firstVariant?.oldPrice ? firstVariant.oldPrice : baseSalePrice * 1.08));

    const discount = baseOldPrice > baseSalePrice
      ? Math.round(((baseOldPrice - baseSalePrice) / baseOldPrice) * 100)
      : 0;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || `Sản phẩm ${p.name} chính hãng chất lượng cao phân phối độc quyền tại Sóc Mobile.`,
      price: baseSalePrice,
      badge: p.badge || (discount > 0 ? `Giảm -${discount}%` : 'Mới'),
      badgeType: (p.badgeType as any) || (discount > 0 ? 'danger' : 'success'),
      image: p.image || firstVariant?.imageUrl || '',
      brand: brandName,
      category: categoryName,
      tags: p.tags?.length ? p.tags : ['featured', brandName.toLowerCase(), categoryName.toLowerCase()],
      rating: Number(p.rating || 5),
      reviewCount: p.reviewCount || 100,
      soldCount: p.soldCount || '1,5k',
      promotionText: p.promotionText || 'Ưu đãi thanh toán quét mã QR & Miễn phí giao hàng hỏa tốc trong 2 giờ',
      installment: p.installment ?? true,
      fastDelivery: p.fastDelivery ?? true,
      specs: {
        screen: '',
        chip: '',
        ram: firstVariant?.ram || '',
      },
      variants: p.variants.map((v) => ({
        id: v.id,
        productId: v.productId,
        storage: v.storage,
        color: v.color || undefined,
        sku: v.sku || undefined,
        imageUrl: v.imageUrl || undefined,
        ram: v.ram || undefined,
        price: Number(v.price),
        oldPrice: v.oldPrice ? Number(v.oldPrice) : Number(v.price),
      })),
    };
  });

  const targetPath = path.resolve(__dirname, '../../frontend/src/data/mock-products.ts');
  const fileContent = `/**
 * Mock Featured Products
 * Dong bo tu database PostgreSQL (chua day du multi-variants cho tung san pham).
 * Total products: ${mockProducts.length}
 */

import { MockProduct } from '@/types/product';

export const FEATURED_PRODUCTS: MockProduct[] = ${JSON.stringify(mockProducts, null, 2)};
`;

  fs.writeFileSync(targetPath, fileContent, 'utf-8');
  console.log(`Da ghi thanh cong vao: ${targetPath}`);
}

syncMock()
  .catch((e) => {
    console.error('Loi khi dong bo mock:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

