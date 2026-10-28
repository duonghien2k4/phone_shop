"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const bcrypt = __importStar(require("bcrypt"));
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('--- Bat dau qua trinh Seed Database PhoneShop ---');
    console.log('1. Khoi tao tai khoan mac dinh...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123456', salt);
    const customerPasswordHash = await bcrypt.hash('customer123456', salt);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@socmobile.vn' },
        update: {
            role: 'ADMIN',
            status: 'ACTIVE',
        },
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
    await prisma.user.upsert({
        where: { email: 'admin@phoneshop.vn' },
        update: {
            role: 'ADMIN',
            status: 'ACTIVE',
        },
        create: {
            email: 'admin@phoneshop.vn',
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
    const customer = await prisma.user.upsert({
        where: { email: 'customer@phoneshop.vn' },
        update: {
            role: 'CUSTOMER',
            status: 'ACTIVE',
        },
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
            cart: {
                create: {},
            },
        },
    });
    console.log(`Da tao/cap nhat Admin (${admin.email}) va Customer (${customer.email}).`);
    console.log('2. Khoi tao doi tac tai chinh tra gop...');
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
    ];
    for (const fp of FINANCE_PARTNERS) {
        await prisma.financePartner.upsert({
            where: { id: fp.id },
            update: fp,
            create: fp,
        });
    }
    console.log(`Da tao/cap nhat ${FINANCE_PARTNERS.length} doi tac tai chinh.`);
    console.log('3. Khoi tao he thong showroom Soc Mobile...');
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
            address: '498 Nguyen Trai, Phuong Thanh Xuan Nam, Quan Thanh Xuan, Ha Noi',
            city: 'Ha Noi',
            readyTime: 'Hom nay luc 17:00',
            isFlagship: false,
        },
    ];
    for (const sr of SHOWROOMS) {
        await prisma.showroomStore.upsert({
            where: { id: sr.id },
            update: sr,
            create: sr,
        });
    }
    console.log(`Da tao/cap nhat ${SHOWROOMS.length} showroom stores.`);
    console.log('4. Doc du lieu san pham tu dataset the_gioi_di_dong/tu_dong.json...');
    const jsonPath = path.resolve(__dirname, '../../../dataset/the_gioi_di_dong/tu_dong.json');
    if (!fs.existsSync(jsonPath)) {
        throw new Error(`Khong tim thay file dataset: ${jsonPath}`);
    }
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const rawProductsData = JSON.parse(rawData);
    const seenIds = new Set();
    const productsData = [];
    for (const item of rawProductsData) {
        if (item && item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            productsData.push(item);
        }
    }
    console.log(`Tim thay ${productsData.length} san pham duy nhat de seed vao database.`);
    const cleanText = (str) => {
        if (!str)
            return '';
        return str
            .replace(/&#x2B;/gi, '+')
            .replace(/&quot;/gi, '"')
            .replace(/&amp;/gi, '&')
            .replace(/&#x27;/gi, "'")
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>');
    };
    const generateSlug = (title, idSuffix) => {
        let slug = title
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
    console.log('5. Upsert Brands va Categories...');
    const brandMap = new Map();
    const categoryMap = new Map();
    for (const item of productsData) {
        const rawBrand = item.brand || 'Khác';
        const rawCategory = item.category || 'Điện thoại';
        const brandName = cleanText(rawBrand).trim();
        const categoryName = cleanText(rawCategory).trim();
        if (!brandMap.has(brandName)) {
            const slug = generateSlug(brandName);
            const brand = await prisma.brand.upsert({
                where: { name: brandName },
                update: { name: brandName },
                create: {
                    name: brandName,
                    slug,
                    description: `Thuong hieu ${brandName} chinh hang`,
                },
            });
            brandMap.set(brandName, brand);
        }
        if (!categoryMap.has(categoryName)) {
            const slug = generateSlug(categoryName);
            const category = await prisma.category.upsert({
                where: { name: categoryName },
                update: { name: categoryName },
                create: {
                    name: categoryName,
                    slug,
                    description: `Danh muc ${categoryName}`,
                },
            });
            categoryMap.set(categoryName, category);
        }
    }
    console.log(`Da tao/cap nhat ${brandMap.size} Brands va ${categoryMap.size} Categories.`);
    console.log('6. Upsert toan bo san pham va bien the vao PostgreSQL...');
    let createdCount = 0;
    let updatedCount = 0;
    for (const item of productsData) {
        const cleanName = cleanText(item.name);
        const slug = generateSlug(cleanName, item.id);
        const rawBrand = item.brand || 'Khác';
        const rawCategory = item.category || 'Điện thoại';
        const brand = brandMap.get(cleanText(rawBrand).trim());
        const category = categoryMap.get(cleanText(rawCategory).trim());
        const screen = item.specs && item.specs[0] ? cleanText(item.specs[0]) : '';
        const chip = item.specs && item.specs[1] ? cleanText(item.specs[1]) : '';
        const ram = item.specs && item.specs[2] ? cleanText(item.specs[2]) : '';
        const basePrice = Number(item.oldPrice || item.price || 0);
        const salePrice = Number(item.price || 0);
        const discount = item.discountPercent
            ? parseInt(item.discountPercent.replace(/[^0-9]/g, ''), 10)
            : basePrice > salePrice && basePrice > 0
                ? Math.round(((basePrice - salePrice) / basePrice) * 100)
                : null;
        const imageUrl = item.imageUrl ||
            'https://cdn.tgdd.vn/Products/Images/42/303891/iphone-15-plus-128gb-den-thumb-600x600.jpg';
        const existingProduct = await prisma.product.findUnique({ where: { id: item.id } });
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
            create: {
                id: item.id,
                ...productPayload,
            },
        });
        if (existingProduct) {
            updatedCount++;
        }
        else {
            createdCount++;
        }
        const existingImage = await prisma.productImage.findFirst({
            where: { productId: product.id },
        });
        if (existingImage) {
            await prisma.productImage.update({
                where: { id: existingImage.id },
                data: { url: imageUrl, altText: cleanName },
            });
        }
        else {
            await prisma.productImage.create({
                data: {
                    productId: product.id,
                    url: imageUrl,
                    altText: cleanName,
                    sortOrder: 0,
                },
            });
        }
        const variantColor = cleanText(item.color) || 'Titan Tự Nhiên';
        const cleanPrice = salePrice > 0 ? salePrice : basePrice;
        const cleanNameLower = cleanName.toLowerCase();
        let specs = [];
        if (cleanPrice < 1500000 || cleanNameLower.includes('nokia 220') || cleanNameLower.includes('masstel') || cleanNameLower.includes('mobell')) {
            specs = [{ storage: 'Tiêu chuẩn', priceDelta: 0 }];
        }
        else if (item.category === 'Laptop' || cleanNameLower.includes('laptop') || cleanNameLower.includes('macbook')) {
            specs = [
                { storage: '256GB SSD', priceDelta: 0, ram: '8GB' },
                { storage: '512GB SSD', priceDelta: 2500000, ram: '16GB' },
                { storage: '1TB SSD', priceDelta: 5800000, ram: '32GB' },
            ];
        }
        else if (item.category === 'Máy tính bảng' || cleanNameLower.includes('ipad') || cleanNameLower.includes('tab')) {
            specs = [
                { storage: '64GB', priceDelta: 0, ram: '4GB' },
                { storage: '128GB', priceDelta: 2000000, ram: '6GB' },
                { storage: '256GB', priceDelta: 4500000, ram: '8GB' },
            ];
        }
        else if (item.category === 'Đồng hồ thông minh' || cleanNameLower.includes('watch')) {
            specs = [
                { storage: '40mm (GPS)', priceDelta: 0 },
                { storage: '44mm (LTE)', priceDelta: 1500000 },
            ];
        }
        else if (cleanPrice >= 25000000 || cleanNameLower.includes('pro max') || cleanNameLower.includes('ultra') || cleanNameLower.includes('fold')) {
            specs = [
                { storage: '256GB', priceDelta: 0, ram: '12GB' },
                { storage: '512GB', priceDelta: 4500000, ram: '12GB' },
                { storage: '1TB', priceDelta: 10500000, ram: '16GB' },
            ];
        }
        else if (cleanPrice >= 14000000) {
            specs = [
                { storage: '128GB', priceDelta: 0, ram: '8GB' },
                { storage: '256GB', priceDelta: 2800000, ram: '8GB' },
                { storage: '512GB', priceDelta: 6500000, ram: '12GB' },
            ];
        }
        else if (cleanPrice >= 6000000) {
            specs = [
                { storage: '128GB', priceDelta: 0, ram: '8GB' },
                { storage: '256GB', priceDelta: 1400000, ram: '8GB' },
                { storage: '512GB', priceDelta: 3200000, ram: '12GB' },
            ];
        }
        else {
            specs = [
                { storage: '64GB', priceDelta: -500000, ram: '4GB' },
                { storage: '128GB', priceDelta: 0, ram: '6GB' },
                { storage: '256GB', priceDelta: 800000, ram: '8GB' },
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
    }
    console.log(`Hoan tat seed san pham! Tao moi: ${createdCount}, Cap nhat: ${updatedCount}.`);
    console.log('--- Qua trinh Seed Database thanh cong 100%! ---');
}
main()
    .catch((e) => {
    console.error('Loi khi seed database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map