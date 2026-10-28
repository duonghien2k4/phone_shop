import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
  console.log('--- KIEM TRA TOAN DIEN CAC BIEN THE (VARIANTS) TRONG DATABASE ---');

  const totalProducts = await prisma.product.count();
  const totalVariants = await prisma.productVariant.count();
  const totalInventory = await prisma.inventory.count();

  console.log(`Tong so san pham: ${totalProducts}`);
  console.log(`Tong so variants: ${totalVariants}`);
  console.log(`Tong so ban ghi kho (Inventory): ${totalInventory}`);

  // Lay san pham dien hinh duoc user nhac den: 17 Pro Max
  const iphone17prm = await prisma.product.findFirst({
    where: {
      name: { contains: '17 Pro Max', mode: 'insensitive' },
    },
    include: {
      variants: {
        orderBy: { price: 'asc' },
        include: { inventory: true },
      },
    },
  });

  if (iphone17prm) {
    console.log(`\nSan pham kiem tra: "${iphone17prm.name}" (ID: ${iphone17prm.id})`);
    console.log(`So luong variants: ${iphone17prm.variants.length}`);
    iphone17prm.variants.forEach((v, index) => {
      console.log(` [Variant #${index + 1}] ID: ${v.id} | Storage: ${v.storage} | RAM: ${v.ram || 'N/A'} | Price: ${new Intl.NumberFormat('vi-VN').format(Number(v.price))}d | OldPrice: ${new Intl.NumberFormat('vi-VN').format(Number(v.oldPrice || 0))}d | Stock: ${v.inventory?.stock} | SKU: ${v.sku}`);
    });
  }

  // Lay san pham laptop dien hinh
  const laptop = await prisma.product.findFirst({
    where: {
      category: { name: { contains: 'Laptop', mode: 'insensitive' } },
    },
    include: {
      variants: {
        orderBy: { price: 'asc' },
      },
    },
  });

  if (laptop) {
    console.log(`\nSan pham Laptop: "${laptop.name}" (ID: ${laptop.id})`);
    console.log(`So luong variants: ${laptop.variants.length}`);
    laptop.variants.forEach((v, index) => {
      console.log(` [Variant #${index + 1}] ID: ${v.id} | Storage: ${v.storage} | RAM: ${v.ram || 'N/A'} | Price: ${new Intl.NumberFormat('vi-VN').format(Number(v.price))}d`);
    });
  }
}

verify()
  .catch((e) => {
    console.error('Loi kiem tra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

