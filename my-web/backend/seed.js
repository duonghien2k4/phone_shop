#!/usr/bin/env node

/**
 * MASTER DATABASE SYNC & SEED SCRIPT FOR PHONE_SHOP
 * 
 * Cong dung:
 * 1. Tu dong dong bo cau truc Database (Schema, Tables, Enums, Foreign Keys) qua Prisma db push.
 * 2. Tu dong nap toan bo du lieu he thong vao PostgreSQL:
 *    - Tai khoan mac dinh (Admin & Customer), Profile, Cart
 *    - Danh muc (Categories) & Thuong hieu (Brands)
 *    - Toan bo Danh muc San pham, Bien the (Variants), Anh, Ton kho tu dataset
 *    - Doi tac tai chinh tra gop & He thong Showroom
 *    - Ma giam gia (Vouchers) & Lich su su dung
 *    - Don hang mau (Orders) & Giao dich thanh toan (Payments)
 *    - Danh gia san pham (Reviews)
 *    - Ho so tra gop mau 7 trang thai nghiep vu & Audit Trail Lich su
 *    - Tro ly AI (Feedbacks, Conversations) & Bao cao loi (BugReports)
 * 
 * Cach su dung:
 *    node seed.js
 *    hoac: npx seed.js
 *    hoac: npm run seed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Dinh vi thu muc du an
const ROOT_DIR = __dirname;
const BACKEND_DIR = fs.existsSync(path.join(ROOT_DIR, 'my-web', 'backend'))
  ? path.join(ROOT_DIR, 'my-web', 'backend')
  : ROOT_DIR;

// Dang ky module paths de require cac thu vien tu backend node_modules
const backendNodeModules = path.join(BACKEND_DIR, 'node_modules');
const rootNodeModules = path.join(ROOT_DIR, 'node_modules');

if (fs.existsSync(backendNodeModules)) {
  module.paths.unshift(backendNodeModules);
}
if (fs.existsSync(rootNodeModules)) {
  module.paths.unshift(rootNodeModules);
}

// 2. Load bien moi truong tu .env
let envLoaded = false;
const backendEnv = path.join(BACKEND_DIR, '.env');
const rootEnv = path.join(ROOT_DIR, '.env');

try {
  const dotenv = require('dotenv');
  if (fs.existsSync(backendEnv)) {
    dotenv.config({ path: backendEnv });
    envLoaded = true;
  } else if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
    envLoaded = true;
  }
} catch {
  // Dotenv chua cai dat, fallback dung bien moi truong he thong
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[LOI] Khong tim thay bien DATABASE_URL trong .env');
  console.error('Vui long kiem tra file .env tai: ' + backendEnv);
  process.exit(1);
}

console.log('================================================================');
console.log('PHONE_SHOP - DONG BO CAU TRUC DATABASE VA TOAN BO DU LIEU SEED');
console.log('================================================================');
console.log('[1/4] Dang ket noi toi PostgreSQL theo DATABASE_URL...');

// 3. Giai doan 1: Dong bo Cau truc Database qua Prisma
console.log('\n[2/4] Dang dong bo toan bo cau truc bang (Schema Migration)...');
const schemaPath = path.join(BACKEND_DIR, 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('[LOI] Khong tim thay file prisma/schema.prisma tai: ' + schemaPath);
  process.exit(1);
}

try {
  console.log('-> Dang chay "npx prisma db push --accept-data-loss"...');
  execSync('npx prisma db push --accept-data-loss', {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    env: process.env,
  });

  console.log('-> Dang chay "npx prisma generate"...');
  execSync('npx prisma generate', {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    env: process.env,
  });
  console.log('[THANH CONG] Da dong bo toan bo cau truc bang va Enums trong DB.');
} catch (error) {
  console.error('[LOI] Khong the dong bo Schema qua Prisma db push:', error.message);
  process.exit(1);
}

// 4. Giai doan 2: Ket noi Prisma Client
let prisma, pool;
try {
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { PrismaClient } = require('@prisma/client');

  pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} catch (error) {
  console.error('[LOI] Khong the khoi tao PrismaClient voi pg adapter:', error.message);
  process.exit(1);
}

// 5. Helper Functions
const cleanText = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&#x2B;/gi, '+')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
};

const generateSlug = (title, idSuffix) => {
  let slug = String(title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  if (idSuffix) {
    slug = `${slug}-${idSuffix}`;
  }
  return slug;
};

// 6. Main Seed Execution
async function runMasterSeed() {
  console.log('\n[3/4] Dang nap du lieu Master Data vao PostgreSQL...');

  const bcrypt = require('bcrypt');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123456', salt);
  const customerPasswordHash = await bcrypt.hash('customer123456', salt);

  // A. Seed Default Users
  console.log('-> 1. Khoi tao tai khoan mac dinh (Admin & Customer)...');
  const adminSocMobile = await prisma.user.upsert({
    where: { email: 'admin@socmobile.vn' },
    update: { role: 'ADMIN', status: 'ACTIVE' },
    create: {
      email: 'admin@socmobile.vn',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Quan Tri Vien Soc Mobile',
          phone: '0988888888',
          address: '180 Nguyen Trai',
          city: 'Ha Noi',
        },
      },
    },
  });

  await prisma.user.updateMany({
    where: {
      role: 'ADMIN',
      NOT: { email: 'admin@socmobile.vn' },
    },
    data: {
      role: 'CUSTOMER',
      refreshToken: null,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@phoneshop.vn' },
    update: { role: 'CUSTOMER', status: 'ACTIVE' },
    create: {
      email: 'customer@phoneshop.vn',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      profile: {
        create: {
          fullName: 'Nguyen Hoang Nam',
          phone: '0988123456',
          address: '123 Duong Cau Giay',
          city: 'Ha Noi',
        },
      },
      cart: { create: {} },
    },
  });
  console.log(`   + Admin Sóc Mobile: ${adminSocMobile.email} (pass: admin123456)`);
  console.log(`   + Customer: ${customer.email} (pass: customer123456)`);

  // B. Seed Finance Partners
  console.log('-> 2. Khoi tao doi tac tai chinh tra gop...');
  const FINANCE_PARTNERS = [
    {
      id: 'home-credit',
      name: 'Home Credit',
      badge: 'Khuyen dung',
      badgeType: 'coral',
      recommended: true,
      approvalRate: 'Duyet 98%',
      interestRate: 0,
      partnerMonthlyFee: 0,
      partnerMonthlyFeeLabel: 'Phi bao hiem khoan vay',
      subtext: 'Uu dai lai suat 0% - Phi bao hiem khoan vay: 0d - Ho tro CCCD toan quoc',
      breakdownNote: 'Lai: 0d',
    },
    {
      id: 'shinhan-finance',
      name: 'Shinhan Finance',
      badge: 'Qua 500k',
      badgeType: 'blue',
      recommended: false,
      approvalRate: 'Duyet 95%',
      interestRate: 0,
      partnerMonthlyFee: 29000,
      partnerMonthlyFeeLabel: 'Phi dich vu ho so',
      subtext: 'Tang voucher 500k phu kien - Lai 0% - Ho tro thu tuc online',
      breakdownNote: 'Phi dich vu: 29k/thang',
    },
    {
      id: 'fe-credit',
      name: 'FE Credit',
      badge: 'Duyet nhanh',
      badgeType: 'gray',
      recommended: false,
      approvalRate: 'Duyet 92%',
      interestRate: 0,
      partnerMonthlyFee: 0,
      partnerMonthlyFeeLabel: 'Phi tham dinh',
      subtext: 'Lai suat 0% - Duyet nhanh qua app FE Online - Khong tham dinh nguoi than',
      breakdownNote: 'Lai: 0d',
    },
    {
      id: 'mcredit',
      name: 'MCredit',
      badge: 'Thu tuc 5p',
      badgeType: 'gray',
      recommended: false,
      approvalRate: 'Duyet 90%',
      interestRate: 0,
      partnerMonthlyFee: 35000,
      partnerMonthlyFeeLabel: 'Phi quan ly tai khoan',
      subtext: 'Han muc linh hoat - Mien phi tat toan truoc han tu ky thu 3',
      breakdownNote: 'Phi quan ly: 35k/thang',
    },
    {
      id: 'hd-saison',
      name: 'HD SAISON',
      badge: 'Lai suat tot',
      badgeType: 'coral',
      recommended: false,
      approvalRate: 'Duyet 94%',
      interestRate: 0,
      partnerMonthlyFee: 0,
      partnerMonthlyFeeLabel: 'Phi ho so',
      subtext: 'Thu tuc tra gop don gian chi can CCCD gan chip - Duyet nhanh trong 15 phut',
      breakdownNote: 'Lai: 0d',
    },
  ];

  for (const fp of FINANCE_PARTNERS) {
    await prisma.financePartner.upsert({
      where: { id: fp.id },
      update: fp,
      create: fp,
    });
  }
  console.log(`   + Da tao/cap nhat ${FINANCE_PARTNERS.length} doi tac tai chinh.`);

  // C. Seed Showrooms
  console.log('-> 3. Khoi tao he thong Showroom Soc Mobile...');
  const SHOWROOMS = [
    {
      id: 'hn-duytan',
      name: 'Showroom Soc Mobile Flagship Duy Tan',
      address: '86 Pho Duy Tan, Phuong Dich Vong Hau, Quan Cau Giay, Ha Noi',
      city: 'Ha Noi',
      readyTime: 'Hom nay luc 15:30 (Sau 30 phut)',
      isFlagship: true,
    },
    {
      id: 'hn-thaiha',
      name: 'Showroom Soc Mobile Thai Ha',
      address: '128 Thai Ha, Phuong Trung Liet, Quan Dong Da, Ha Noi',
      city: 'Ha Noi',
      readyTime: 'Hom nay luc 16:00',
      isFlagship: false,
    },
    {
      id: 'hn-caugiay',
      name: 'Showroom Soc Mobile Cau Giay',
      address: '254 Cau Giay, Phuong Quan Hoa, Quan Cau Giay, Ha Noi',
      city: 'Ha Noi',
      readyTime: 'Hom nay luc 16:30',
      isFlagship: false,
    },
    {
      id: 'hn-nguyentrai',
      name: 'Showroom Soc Mobile Nguyen Trai',
      address: '180 Nguyen Trai, Phuong Thuong Dinh, Quan Thanh Xuan, Ha Noi',
      city: 'Ha Noi',
      readyTime: 'Hom nay luc 17:00',
      isFlagship: true,
    },
  ];

  for (const sr of SHOWROOMS) {
    await prisma.showroomStore.upsert({
      where: { id: sr.id },
      update: sr,
      create: sr,
    });
  }
  console.log(`   + Da tao/cap nhat ${SHOWROOMS.length} Showrooms.`);

  // D. Seed Dataset Products from tu_dong.json
  console.log('-> 4. Doc va nap danh muc San pham tu dataset...');
  let jsonPath = path.join(ROOT_DIR, 'dataset', 'the_gioi_di_dong', 'tu_dong.json');
  if (!fs.existsSync(jsonPath)) {
    jsonPath = path.join(BACKEND_DIR, 'prisma', 'data', 'mock-products.json');
  }

  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const rawProducts = JSON.parse(rawData);

    const seenIds = new Set();
    const productsData = [];
    for (const item of rawProducts) {
      if (item && item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        productsData.push(item);
      }
    }

    // Brands & Categories
    const brandMap = new Map();
    const categoryMap = new Map();

    for (const item of productsData) {
      const bName = cleanText(item.brand || 'Khác').trim();
      const cName = cleanText(item.category || 'Điện thoại').trim();

      if (!brandMap.has(bName)) {
        const brand = await prisma.brand.upsert({
          where: { name: bName },
          update: { name: bName },
          create: {
            name: bName,
            slug: generateSlug(bName),
            description: `Thuong hieu ${bName} chinh hang`,
          },
        });
        brandMap.set(bName, brand);
      }

      if (!categoryMap.has(cName)) {
        const category = await prisma.category.upsert({
          where: { name: cName },
          update: { name: cName },
          create: {
            name: cName,
            slug: generateSlug(cName),
            description: `Danh muc ${cName}`,
          },
        });
        categoryMap.set(cName, category);
      }
    }

    console.log(`   + Da dong bo ${brandMap.size} Brands va ${categoryMap.size} Categories.`);

    // Upsert Products & Variants & Inventories
    let pCount = 0;
    for (const item of productsData) {
      const cleanName = cleanText(item.name);
      const slug = generateSlug(cleanName, item.id);
      const brand = brandMap.get(cleanText(item.brand || 'Khác').trim());
      const category = categoryMap.get(cleanText(item.category || 'Điện thoại').trim());

      const screen = item.specs && item.specs[0] ? cleanText(item.specs[0]) : '';
      const chip = item.specs && item.specs[1] ? cleanText(item.specs[1]) : '';
      const ram = item.specs && item.specs[2] ? cleanText(item.specs[2]) : '';

      const basePrice = Number(item.oldPrice || item.price || 0);
      const salePrice = Number(item.price || 0);
      const discount = item.discountPercent
        ? parseInt(String(item.discountPercent).replace(/[^0-9]/g, ''), 10)
        : basePrice > salePrice && basePrice > 0
        ? Math.round(((basePrice - salePrice) / basePrice) * 100)
        : null;

      const imageUrl =
        item.imageUrl ||
        'https://cdn.tgdd.vn/Products/Images/42/303891/iphone-15-plus-128gb-den-thumb-600x600.jpg';

      const productPayload = {
        name: cleanName,
        slug,
        brandId: brand.id,
        categoryId: category.id,
        description: `San pham ${cleanName} chinh hang chat luong cao phan phoi tai Soc Mobile.`,
        specs: { screen, chip, ram },
        basePrice: basePrice > 0 ? basePrice : salePrice,
        salePrice: salePrice > 0 ? salePrice : null,
        discount,
        image: imageUrl,
        badge: discount ? `Giam -${discount}%` : 'Tra gop 0%',
        badgeType: discount ? 'danger' : 'success',
        soldCount: item.soldCount ? String(item.soldCount) : '1,5k',
        promotionText: 'Uu dai thanh toan quet ma QR va Mien phi giao hang hoa toc trong 2 gio',
        installment: item.installment ?? true,
        fastDelivery: true,
        rating: item.rating ? Number(item.rating) : 5.0,
        reviewCount: Math.floor(Math.random() * 500) + 50,
        isActive: true,
        isFeatured: true,
        tags: ['featured', brand.name.toLowerCase(), category.name.toLowerCase()],
      };

      const product = await prisma.product.upsert({
        where: { id: item.id },
        update: productPayload,
        create: { id: item.id, ...productPayload },
      });

      // ProductImage
      const existingImg = await prisma.productImage.findFirst({ where: { productId: product.id } });
      if (existingImg) {
        await prisma.productImage.update({
          where: { id: existingImg.id },
          data: { url: imageUrl, altText: cleanName },
        });
      } else {
        await prisma.productImage.create({
          data: { productId: product.id, url: imageUrl, altText: cleanName, sortOrder: 0 },
        });
      }

      // Variants
      const variantColor = cleanText(item.color) || 'Titan Tu Nhien';
      const cleanPrice = salePrice > 0 ? salePrice : basePrice;
      const cleanNameLower = cleanName.toLowerCase();

      let specs = [];
      if (cleanPrice < 1500000 || cleanNameLower.includes('nokia 220') || cleanNameLower.includes('masstel') || cleanNameLower.includes('mobell')) {
        specs = [{ storage: 'Tieu chuan', priceDelta: 0 }];
      } else if (cleanPrice >= 25000000 || cleanNameLower.includes('pro max') || cleanNameLower.includes('ultra')) {
        specs = [
          { storage: '256GB', priceDelta: 0, ram: '12GB' },
          { storage: '512GB', priceDelta: 4500000, ram: '12GB' },
          { storage: '1TB', priceDelta: 10500000, ram: '16GB' },
        ];
      } else if (cleanPrice >= 14000000) {
        specs = [
          { storage: '128GB', priceDelta: 0, ram: '8GB' },
          { storage: '256GB', priceDelta: 2800000, ram: '8GB' },
          { storage: '512GB', priceDelta: 6500000, ram: '12GB' },
        ];
      } else {
        specs = [
          { storage: '64GB', priceDelta: 0, ram: '4GB' },
          { storage: '128GB', priceDelta: 1200000, ram: '6GB' },
        ];
      }

      for (const sp of specs) {
        const vPrice = Math.max(300000, Math.round(cleanPrice + sp.priceDelta));
        const deltaRatio = cleanPrice > 0 ? vPrice / cleanPrice : 1;
        const vOldPrice = basePrice > cleanPrice
          ? Math.round(basePrice * deltaRatio)
          : Math.round(vPrice * 1.08);

        const storageSlug = sp.storage.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const colorSlug = variantColor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const vSku = `${brand.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${item.id}-${storageSlug}-${colorSlug}`;

        const variant = await prisma.productVariant.upsert({
          where: {
            productId_color_storage: {
              productId: product.id,
              color: variantColor,
              storage: sp.storage,
            },
          },
          update: {
            price: vPrice,
            oldPrice: vOldPrice > vPrice ? vOldPrice : null,
            sku: vSku,
            ram: sp.ram || ram || null,
            imageUrl,
          },
          create: {
            productId: product.id,
            color: variantColor,
            storage: sp.storage,
            ram: sp.ram || ram || null,
            sku: vSku,
            price: vPrice,
            oldPrice: vOldPrice > vPrice ? vOldPrice : null,
            imageUrl,
          },
        });

        await prisma.inventory.upsert({
          where: { variantId: variant.id },
          update: { stock: 100, status: 'IN_STOCK' },
          create: {
            variantId: variant.id,
            stock: 100,
            reserved: 0,
            status: 'IN_STOCK',
          },
        });
      }

      pCount++;
    }
    console.log(`   + Da nap va khoi tao ton kho cho ${pCount} san pham tu dataset.`);
  }

  // E. Seed Vouchers
  console.log('-> 5. Khoi tao ma giam gia (Vouchers)...');
  const vouchers = [
    {
      code: 'GIAM50',
      description: 'Giam 50.000d cho don hang tu 100.000d',
      discountType: 'FIXED',
      discountValue: 50000,
      minOrderValue: 100000,
      maxDiscount: 50000,
      usageLimit: 500,
      usedCount: 42,
      isActive: true,
      startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'SOC2K',
      description: 'Giam 2.000d cho moi don hang thu nghiem',
      discountType: 'FIXED',
      discountValue: 2000,
      minOrderValue: 0,
      maxDiscount: 2000,
      usageLimit: 1000,
      usedCount: 15,
      isActive: true,
      startsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'FLAGSHIPVIP',
      description: 'Giam 5% toi da 1.500.000d cho cac dong may cao cap',
      discountType: 'PERCENT',
      discountValue: 5,
      minOrderValue: 15000000,
      maxDiscount: 1500000,
      usageLimit: 100,
      usedCount: 28,
      isActive: true,
      startsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'HELLOSOC',
      description: 'Ma chao mung thanh vien moi giam 100.000d',
      discountType: 'FIXED',
      discountValue: 100000,
      minOrderValue: 500000,
      maxDiscount: 100000,
      usageLimit: 200,
      usedCount: 89,
      isActive: true,
      startsAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      code: 'TROGIA1M',
      description: 'Tro gia 1.000.000d khi tham gia Thu cu doi moi',
      discountType: 'FIXED',
      discountValue: 1000000,
      minOrderValue: 5000000,
      maxDiscount: 1000000,
      usageLimit: 500,
      usedCount: 120,
      isActive: true,
      startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const v of vouchers) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: v,
      create: v,
    });
  }
  console.log(`   + Da tao/cap nhat ${vouchers.length} Vouchers.`);

  // F. Seed Sample Orders & Payments
  console.log('-> 6. Khoi tao don hang mau & thanh toan...');
  const sampleProducts = await prisma.product.findMany({
    take: 6,
    include: { variants: true },
  });

  const existingOrders = await prisma.order.count();
  if (existingOrders === 0 && customer && sampleProducts.length > 0) {
    const orderTemplates = [
      {
        status: 'DELIVERED',
        paymentMethod: 'VNPAY',
        paymentStatus: 'PAID',
        shippingAddress: {
          name: 'Nguyen Van An',
          phone: '0987654321',
          address: '123 Le Loi, Ben Nghe, Quan 1',
          city: 'TP. Ho Chi Minh',
        },
        voucherCode: 'GIAM50',
        discount: 50000,
        shippingFee: 0,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        status: 'SHIPPING',
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        shippingAddress: {
          name: 'Tran Thi Mai',
          phone: '0912345678',
          address: '45 Cau Giay, Quan Hoa, Cau Giay',
          city: 'Ha Noi',
        },
        voucherCode: null,
        discount: 0,
        shippingFee: 30000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        status: 'CONFIRMED',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PAID',
        shippingAddress: {
          name: 'Le Hoang Nam',
          phone: '0909112233',
          address: '78 Nguyen Thi Minh Khai, Hai Chau',
          city: 'Da Nang',
        },
        voucherCode: 'FLAGSHIPVIP',
        discount: 1500000,
        shippingFee: 0,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        status: 'PENDING',
        paymentMethod: 'MOMO',
        paymentStatus: 'PENDING',
        shippingAddress: {
          name: 'Pham Thuy Dung',
          phone: '0933445566',
          address: '22 Vo Van Ngan, Thu Duc',
          city: 'TP. Ho Chi Minh',
        },
        voucherCode: 'SOC2K',
        discount: 2000,
        shippingFee: 30000,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        status: 'CANCELLED',
        paymentMethod: 'COD',
        paymentStatus: 'FAILED',
        shippingAddress: {
          name: 'Dang Quoc Huy',
          phone: '0977889900',
          address: '15 Phan Boi Chau, Hong Bang',
          city: 'Hai Phong',
        },
        voucherCode: null,
        discount: 0,
        shippingFee: 30000,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    for (let i = 0; i < orderTemplates.length; i++) {
      const tpl = orderTemplates[i];
      const prod = sampleProducts[i % sampleProducts.length];
      const variant = prod.variants[0];
      const unitPrice = Number(variant?.price || prod.salePrice || prod.basePrice);
      const subtotal = unitPrice;
      const total = Math.max(0, subtotal + tpl.shippingFee - tpl.discount);

      await prisma.order.create({
        data: {
          userId: customer.id,
          status: tpl.status,
          subtotal,
          shippingFee: tpl.shippingFee,
          discount: tpl.discount,
          total,
          voucherCode: tpl.voucherCode,
          shippingAddress: tpl.shippingAddress,
          paymentMethod: tpl.paymentMethod,
          paymentStatus: tpl.paymentStatus,
          createdAt: tpl.createdAt,
          items: {
            create: [
              {
                productId: prod.id,
                variantId: variant.id,
                productName: prod.name,
                color: variant.color || 'Mac dinh',
                storage: variant.storage || 'Tieu chuan',
                imageUrl: variant.imageUrl || prod.image,
                quantity: 1,
                unitPrice,
                total: subtotal,
                createdAt: tpl.createdAt,
              },
            ],
          },
          payment: {
            create: {
              method: tpl.paymentMethod,
              status: tpl.paymentStatus,
              amount: total,
              transactionId: `TXN-${Date.now()}-${i}`,
              paidAt: tpl.paymentStatus === 'PAID' ? tpl.createdAt : null,
            },
          },
        },
      });
    }
    console.log(`   + Da tao ${orderTemplates.length} don hang mau voi day du trang thai.`);
  }

  // G. Seed Reviews
  console.log('-> 7. Khoi tao danh gia san pham...');
  const existingReviews = await prisma.review.count();
  if (existingReviews === 0 && customer && sampleProducts.length > 0) {
    const reviewsData = [
      {
        userId: customer.id,
        productId: sampleProducts[0].id,
        rating: 5,
        comment: 'May rat dep, dong goi nguyen seal ky cang, nhan vien tu van nhiet tinh!',
        isVisible: true,
      },
      {
        userId: customer.id,
        productId: sampleProducts[1].id,
        rating: 4,
        comment: 'Giao hang hoa toc trong 2 gio dung hen. Pin trau xai muot ma.',
        isVisible: true,
      },
      {
        userId: customer.id,
        productId: sampleProducts[2].id,
        rating: 5,
        comment: 'Chat luong hang chinh hang Soc Mobile rat tin tuong, bao hanh chu dao.',
        isVisible: true,
      },
      {
        userId: customer.id,
        productId: sampleProducts[3].id,
        rating: 2,
        comment: 'May dung tot nhung hop co vet can nhe do don vi van chuyen cau tha.',
        isVisible: false,
      },
    ];

    for (const r of reviewsData) {
      await prisma.review.create({
        data: { ...r, imageUrls: [] },
      });
    }
    console.log(`   + Da tao ${reviewsData.length} danh gia mau.`);
  }

  // H. Seed Installment Applications (7 Trang thai nghiep vu)
  console.log('-> 8. Khoi tao ho so tra gop mau (7 trang thai State Machine & Audit Trail)...');
  const existingApps = await prisma.installmentApplication.count();
  const partners = await prisma.financePartner.findMany();

  if (existingApps === 0 && partners.length > 0) {
    const feCredit = partners.find(p => p.id.includes('fe')) || partners[0];
    const hdSaison = partners.find(p => p.id.includes('hd')) || partners[1] || partners[0];
    const homeCredit = partners.find(p => p.id.includes('home')) || partners[2] || partners[0];
    const shinhan = partners.find(p => p.id.includes('shinhan')) || partners[0];

    const sampleInstallments = [
      {
        applicationCode: 'INS-2026-108234',
        financePartnerId: feCredit.id,
        productName: 'iPhone 15 Pro Max 256GB Titan Tu Nhien',
        productPrice: 29990000,
        prepaidPercent: 20,
        downPayment: 5998000,
        financedAmount: 23992000,
        termMonths: 12,
        monthlyPayment: 2185000,
        status: 'SUBMITTED',
        fullName: 'Nguyen Van An',
        citizenId: '001095012345',
        phoneNumber: '0901234567',
        email: 'an.nguyen95@gmail.com',
        permanentAddress: 'Phuong Hang Bong, Quan Hoan Kiem, Ha Noi',
        currentAddress: 'So 45 Trang Thi, Hoan Kiem, Ha Noi',
        jobTitle: 'Ky su phan mem',
        monthlyIncome: '25-35 trieu',
        companyName: 'FPT Software',
        refRelation: 'Dong nghiep',
        refName: 'Tran Minh Duc',
        refPhone: '0912345678',
        deliveryMethod: 'shop',
        pickupStoreId: 'hn-duytan',
        idCardFrontUrl: '/uploads/installment/cccd-front-demo.png',
        idCardBackUrl: '/uploads/installment/cccd-back-demo.png',
        submittedAt: new Date(Date.now() - 3600000 * 2),
        history: [
          {
            fromStatus: null,
            toStatus: 'SUBMITTED',
            action: 'CUSTOMER_SUBMIT',
            reason: 'Khach hang nop ho so dang ky tra gop',
            actorType: 'CUSTOMER',
            createdAt: new Date(Date.now() - 3600000 * 2),
          },
        ],
      },
      {
        applicationCode: 'INS-2026-108235',
        financePartnerId: hdSaison.id,
        productName: 'Samsung Galaxy S24 Ultra 512GB Xam Titan',
        productPrice: 31990000,
        prepaidPercent: 30,
        downPayment: 9597000,
        financedAmount: 22393000,
        termMonths: 9,
        monthlyPayment: 2680000,
        status: 'UNDER_REVIEW',
        fullName: 'Tran Thi Thu Ha',
        citizenId: '038198005678',
        phoneNumber: '0938456789',
        email: 'thuha.tran@outlook.com',
        permanentAddress: 'Xa Phu Cuong, Soc Son, Ha Noi',
        currentAddress: 'So 12 Chua Boc, Dong Da, Ha Noi',
        jobTitle: 'Chuyen vien Marketing',
        monthlyIncome: '18-22 trieu',
        companyName: 'VNG Corporation',
        refRelation: 'Chi gai',
        refName: 'Tran Thi Mai',
        refPhone: '0987654321',
        deliveryMethod: 'home',
        idCardFrontUrl: '/uploads/installment/cccd-front-demo.png',
        idCardBackUrl: '/uploads/installment/cccd-back-demo.png',
        submittedAt: new Date(Date.now() - 3600000 * 8),
        reviewedAt: new Date(Date.now() - 3600000 * 4),
        history: [
          {
            fromStatus: null,
            toStatus: 'SUBMITTED',
            action: 'CUSTOMER_SUBMIT',
            reason: 'Khach hang gui ho so',
            actorType: 'CUSTOMER',
            createdAt: new Date(Date.now() - 3600000 * 8),
          },
          {
            fromStatus: 'SUBMITTED',
            toStatus: 'UNDER_REVIEW',
            action: 'STAFF_CLAIM',
            reason: 'Nhan vien tiep nhan ho so xac minh KYC',
            actorType: 'STAFF',
            createdAt: new Date(Date.now() - 3600000 * 4),
          },
        ],
      },
      {
        applicationCode: 'INS-2026-108236',
        financePartnerId: homeCredit.id,
        productName: 'Xiaomi 14 Ultra 512GB Den',
        productPrice: 27490000,
        prepaidPercent: 20,
        downPayment: 5498000,
        financedAmount: 21992000,
        termMonths: 6,
        monthlyPayment: 3880000,
        status: 'NEED_MORE_INFO',
        additionalInfoNotes: 'Anh mat sau CCCD bi choi sang mat so dinh danh. Vui long chup lai ro net.',
        fullName: 'Le Hoang Nam',
        citizenId: '040092008765',
        phoneNumber: '0977889900',
        email: 'nam.lehoang@gmail.com',
        permanentAddress: 'Phuong Tan Dinh, Quan 1, TP. Ho Chi Minh',
        currentAddress: 'So 88 Le Thanh Ton, Quan 1, TP.HCM',
        jobTitle: 'Ke toan truong',
        monthlyIncome: '30 trieu',
        companyName: 'Saigon Food',
        refRelation: 'Ban be',
        refName: 'Dang Tuan Anh',
        refPhone: '0966554433',
        deliveryMethod: 'shop',
        pickupStoreId: 'hn-duytan',
        idCardFrontUrl: '/uploads/installment/cccd-front-demo.png',
        idCardBackUrl: '/uploads/installment/cccd-back-demo.png',
        submittedAt: new Date(Date.now() - 3600000 * 24),
        reviewedAt: new Date(Date.now() - 3600000 * 18),
        history: [
          {
            fromStatus: null,
            toStatus: 'SUBMITTED',
            action: 'CUSTOMER_SUBMIT',
            reason: 'Khach hang gui ho so',
            actorType: 'CUSTOMER',
            createdAt: new Date(Date.now() - 3600000 * 24),
          },
          {
            fromStatus: 'SUBMITTED',
            toStatus: 'UNDER_REVIEW',
            action: 'STAFF_CLAIM',
            reason: 'Nhan vien kiem tra giay to',
            actorType: 'STAFF',
            createdAt: new Date(Date.now() - 3600000 * 20),
          },
          {
            fromStatus: 'UNDER_REVIEW',
            toStatus: 'NEED_MORE_INFO',
            action: 'REQUEST_INFO',
            reason: 'Anh mat sau CCCD bi choi sang mat so dinh danh',
            actorType: 'STAFF',
            createdAt: new Date(Date.now() - 3600000 * 18),
          },
        ],
      },
      {
        applicationCode: 'INS-2026-108237',
        financePartnerId: shinhan.id,
        productName: 'iPhone 15 Plus 128GB Xanh Duong',
        productPrice: 22490000,
        prepaidPercent: 40,
        downPayment: 8996000,
        financedAmount: 13494000,
        termMonths: 12,
        monthlyPayment: 1245000,
        status: 'PARTNER_REVIEW',
        fullName: 'Pham Minh Quang',
        citizenId: '031097003456',
        phoneNumber: '0918765432',
        email: 'minhquang.pham@gmail.com',
        permanentAddress: 'TP. Thu Duc, TP. Ho Chi Minh',
        currentAddress: 'Chung cu Masteri Thao Dien, Quan 2, TP.HCM',
        jobTitle: 'Kien truc su',
        monthlyIncome: '28 trieu',
        companyName: 'Green Space Architecture',
        refRelation: 'Dong nghiep',
        refName: 'Hoang Hai Dang',
        refPhone: '0909887766',
        deliveryMethod: 'shop',
        pickupStoreId: 'hn-duytan',
        idCardFrontUrl: '/uploads/installment/cccd-front-demo.png',
        idCardBackUrl: '/uploads/installment/cccd-back-demo.png',
        submittedAt: new Date(Date.now() - 3600000 * 30),
        reviewedAt: new Date(Date.now() - 3600000 * 12),
        history: [
          {
            fromStatus: null,
            toStatus: 'SUBMITTED',
            action: 'CUSTOMER_SUBMIT',
            reason: 'Khach hang gui ho so',
            actorType: 'CUSTOMER',
            createdAt: new Date(Date.now() - 3600000 * 30),
          },
          {
            fromStatus: 'SUBMITTED',
            toStatus: 'UNDER_REVIEW',
            action: 'STAFF_CLAIM',
            reason: 'Kiem tra ho so hop le',
            actorType: 'STAFF',
            createdAt: new Date(Date.now() - 3600000 * 20),
          },
          {
            fromStatus: 'UNDER_REVIEW',
            toStatus: 'PARTNER_REVIEW',
            action: 'SUBMIT_TO_PARTNER',
            reason: 'Chuyen ho so sang Shinhan Finance de tham dinh tin dung',
            actorType: 'STAFF',
            createdAt: new Date(Date.now() - 3600000 * 12),
          },
        ],
      },
      {
        applicationCode: 'INS-2026-108238',
        financePartnerId: feCredit.id,
        productName: 'iPhone 15 Pro 128GB Titan Tu Nhien',
        productPrice: 25490000,
        prepaidPercent: 20,
        downPayment: 5098000,
        financedAmount: 20392000,
        termMonths: 12,
        monthlyPayment: 1875000,
        status: 'APPROVED',
        decisionSource: 'PARTNER',
        decisionReason: 'Diem tin dung CIC tot, doi tac FE Credit phe duyet 100% han muc.',
        referenceCode: 'PART-FE-982143',
        fullName: 'Vu Quoc Kien',
        citizenId: '001099001234',
        phoneNumber: '0988776655',
        email: 'kienvu.developer@gmail.com',
        permanentAddress: 'Cau Giay, Ha Noi',
        currentAddress: 'So 18 Duy Tan, Dich Vong Hau, Cau Giay, Ha Noi',
        jobTitle: 'Ky su AI',
        monthlyIncome: '35 trieu',
        companyName: 'Viettel',
        refRelation: 'Dong nghiep',
        refName: 'Nguyen Tien Dat',
        refPhone: '0971239876',
        deliveryMethod: 'shop',
        pickupStoreId: 'hn-duytan',
        idCardFrontUrl: '/uploads/installment/cccd-front-demo.png',
        idCardBackUrl: '/uploads/installment/cccd-back-demo.png',
        submittedAt: new Date(Date.now() - 3600000 * 48),
        reviewedAt: new Date(Date.now() - 3600000 * 24),
        decidedAt: new Date(Date.now() - 3600000 * 10),
        history: [
          {
            fromStatus: null,
            toStatus: 'SUBMITTED',
            action: 'CUSTOMER_SUBMIT',
            reason: 'Khach nop ho so',
            actorType: 'CUSTOMER',
            createdAt: new Date(Date.now() - 3600000 * 48),
          },
          {
            fromStatus: 'SUBMITTED',
            toStatus: 'UNDER_REVIEW',
            action: 'STAFF_CLAIM',
            reason: 'Tiep nhan xu ly',
            actorType: 'STAFF',
            createdAt: new Date(Date.now() - 3600000 * 36),
          },
          {
            fromStatus: 'UNDER_REVIEW',
            toStatus: 'PARTNER_REVIEW',
            action: 'SUBMIT_TO_PARTNER',
            reason: 'Chuyen sang FE Credit',
            actorType: 'STAFF',
            createdAt: new Date(Date.now() - 3600000 * 24),
          },
          {
            fromStatus: 'PARTNER_REVIEW',
            toStatus: 'APPROVED',
            action: 'RECORD_DECISION',
            reason: 'Diem tin dung CIC tot, doi tac FE Credit phe duyet 100% han muc.',
            actorType: 'STAFF',
            createdAt: new Date(Date.now() - 3600000 * 10),
          },
        ],
      },
      {
        applicationCode: 'INS-2026-108239',
        financePartnerId: hdSaison.id,
        productName: 'OPPO Find X7 Ultra 256GB Nau Da',
        productPrice: 21990000,
        prepaidPercent: 20,
        downPayment: 4398000,
        financedAmount: 17592000,
        termMonths: 6,
        monthlyPayment: 3120000,
        status: 'REJECTED',
        decisionSource: 'INTERNAL',
        decisionReason: 'Thong tin nguoi tham chieu khong chinh xac, khong lien lac duoc.',
        referenceCode: 'INT-REJ-202601',
        fullName: 'Hoang Dinh Trong',
        citizenId: '025091004567',
        phoneNumber: '0945671234',
        email: 'trong.hoang@gmail.com',
        permanentAddress: 'TP. Bien Hoa, Dong Nai',
        currentAddress: 'Duong Nguyen Ai Quoc, Bien Hoa, Dong Nai',
        jobTitle: 'Kinh doanh tu do',
        monthlyIncome: '15 trieu',
        companyName: 'Ca nhan',
        refRelation: 'Ban be',
        refName: 'Le Van B',
        refPhone: '0900000000',
        deliveryMethod: 'home',
        idCardFrontUrl: '/uploads/installment/cccd-front-demo.png',
        idCardBackUrl: '/uploads/installment/cccd-back-demo.png',
        submittedAt: new Date(Date.now() - 3600000 * 72),
        reviewedAt: new Date(Date.now() - 3600000 * 60),
        decidedAt: new Date(Date.now() - 3600000 * 50),
        history: [
          {
            fromStatus: null,
            toStatus: 'SUBMITTED',
            action: 'CUSTOMER_SUBMIT',
            reason: 'Khach nop ho so',
            actorType: 'CUSTOMER',
            createdAt: new Date(Date.now() - 3600000 * 72),
          },
          {
            fromStatus: 'SUBMITTED',
            toStatus: 'UNDER_REVIEW',
            action: 'STAFF_CLAIM',
            reason: 'Tiep nhan kiem tra',
            actorType: 'STAFF',
            createdAt: new Date(Date.now() - 3600000 * 60),
          },
          {
            fromStatus: 'UNDER_REVIEW',
            toStatus: 'REJECTED',
            action: 'RECORD_DECISION',
            reason: 'Thong tin nguoi tham chieu khong chinh xac, khong lien lac duoc.',
            actorType: 'STAFF',
            createdAt: new Date(Date.now() - 3600000 * 50),
          },
        ],
      },
      {
        applicationCode: 'INS-2026-108240',
        financePartnerId: homeCredit.id,
        productName: 'Samsung Galaxy Z Fold6 256GB Xam',
        productPrice: 41990000,
        prepaidPercent: 50,
        downPayment: 20995000,
        financedAmount: 20995000,
        termMonths: 12,
        monthlyPayment: 1910000,
        status: 'CANCELLED',
        decisionReason: 'Khach hang chu dong huy yeu cau do doi sang phuong thuc thanh toan tra thang.',
        fullName: 'Pham Thi Lan',
        citizenId: '034195009876',
        phoneNumber: '0971122334',
        email: 'lan.pham@gmail.com',
        permanentAddress: 'Phuong Hang Trong, Hoan Kiem, Ha Noi',
        currentAddress: 'So 67 Ly Thuong Kiet, Hoan Kiem, Ha Noi',
        jobTitle: 'Giam doc Kinh doanh',
        monthlyIncome: '50 trieu',
        companyName: 'Ha Noi Real Estate',
        refRelation: 'Chong',
        refName: 'Nguyen Van C',
        refPhone: '0988001122',
        deliveryMethod: 'shop',
        pickupStoreId: 'hn-duytan',
        idCardFrontUrl: '/uploads/installment/cccd-front-demo.png',
        idCardBackUrl: '/uploads/installment/cccd-back-demo.png',
        submittedAt: new Date(Date.now() - 3600000 * 96),
        decidedAt: new Date(Date.now() - 3600000 * 90),
        history: [
          {
            fromStatus: null,
            toStatus: 'SUBMITTED',
            action: 'CUSTOMER_SUBMIT',
            reason: 'Khach nop ho so',
            actorType: 'CUSTOMER',
            createdAt: new Date(Date.now() - 3600000 * 96),
          },
          {
            fromStatus: 'SUBMITTED',
            toStatus: 'CANCELLED',
            action: 'CUSTOMER_CANCEL',
            reason: 'Khach hang chu dong huy yeu cau do doi sang phuong thuc thanh toan tra thang.',
            actorType: 'CUSTOMER',
            createdAt: new Date(Date.now() - 3600000 * 90),
          },
        ],
      },
    ];

    for (const app of sampleInstallments) {
      const { history, ...appData } = app;
      const created = await prisma.installmentApplication.create({
        data: appData,
      });
      for (const h of history) {
        await prisma.applicationStatusHistory.create({
          data: { applicationId: created.id, ...h },
        });
      }
    }
    console.log(`   + Da tao ${sampleInstallments.length} ho so tra gop mau voi day du 7 trang thai nghiep vu.`);
  }

  // I. Seed AI Feedbacks & Bug Reports
  console.log('-> 9. Khoi tao phan hoi AI & Bao cao loi...');
  const existingAi = await prisma.aiFeedback.count();
  if (existingAi === 0) {
    await prisma.aiFeedback.createMany({
      data: [
        {
          userId: customer?.id,
          query: 'Tu van cho minh dien thoai chup anh dep duoi 20 trieu',
          response: 'Chao ban, trong tam gia duoi 20 trieu, Soc Mobile de xuat iPhone 15 128GB hoac Xiaomi 14 voi cum camera Leica cao cap...',
          rating: 5,
          comment: 'Cau tra loi rat nhanh va dung nhu cau',
        },
        {
          userId: customer?.id,
          query: 'Cua hang co ho tro tra gop 0% qua Home Credit khong?',
          response: 'Da co, Soc Mobile lien ket voi Home Credit ho tro tra gop 0% lai suat voi ky han linh hoat 6, 9, 12 thang...',
          rating: 5,
          comment: 'Ro rang, de hieu',
        },
      ],
    });
    console.log('   + Da tao phan hoi danh gia AI mau.');
  }

  const existingBugs = await prisma.bugReport.count();
  if (existingBugs === 0) {
    await prisma.bugReport.createMany({
      data: [
        {
          userId: customer?.id,
          title: 'Loi tai anh khi xem chi tiet san pham tren Safari',
          description: 'Trang load hoi cham khi mo modal tren iOS 16.',
          status: 'RESOLVED',
          imageUrls: [],
        },
      ],
    });
    console.log('   + Da tao bao cao loi mau.');
  }

  console.log('\n[4/4] Kiem tra tong ket du lieu da dong bo:');
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();
  const totalVariants = await prisma.productVariant.count();
  const totalOrders = await prisma.order.count();
  const totalInstallments = await prisma.installmentApplication.count();
  const totalVouchers = await prisma.voucher.count();

  console.log('----------------------------------------------------------------');
  console.log(`- Tong so User:                 ${totalUsers}`);
  console.log(`- Tong so San pham:             ${totalProducts}`);
  console.log(`- Tong so Bien the (Variants):  ${totalVariants}`);
  console.log(`- Tong so Don hang:             ${totalOrders}`);
  console.log(`- Tong so Ho so tra gop:        ${totalInstallments}`);
  console.log(`- Tong so Ma giam gia:          ${totalVouchers}`);
  console.log('----------------------------------------------------------------');
  console.log('[HOAN TAT] TOAN BO DATABASE VA SCHEMA DA DUOC DONG BO THANH CONG 100%!');
  console.log('================================================================\n');
}

runMasterSeed()
  .catch((err) => {
    console.error('[LOI FATAL]', err);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
    if (pool) await pool.end();
  });
