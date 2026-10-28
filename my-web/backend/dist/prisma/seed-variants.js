"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
function getVariantSpecsForProduct(product) {
    const price = Number(product.salePrice || product.basePrice || 0);
    const nameLower = product.name.toLowerCase();
    const categoryName = product.category?.name || 'Điện thoại';
    if (price < 1500000 || nameLower.includes('nokia 220') || nameLower.includes('masstel') || nameLower.includes('mobell')) {
        return [
            { storage: 'Tiêu chuẩn', priceDelta: 0 },
        ];
    }
    if (categoryName.toLowerCase().includes('laptop') || nameLower.includes('laptop') || nameLower.includes('macbook')) {
        return [
            { storage: '256GB SSD', priceDelta: 0, ram: '8GB' },
            { storage: '512GB SSD', priceDelta: 2500000, ram: '16GB' },
            { storage: '1TB SSD', priceDelta: 5800000, ram: '32GB' },
        ];
    }
    if (categoryName.toLowerCase().includes('tablet') || nameLower.includes('ipad') || nameLower.includes('tab')) {
        return [
            { storage: '64GB', priceDelta: 0, ram: '4GB' },
            { storage: '128GB', priceDelta: 2000000, ram: '6GB' },
            { storage: '256GB', priceDelta: 4500000, ram: '8GB' },
        ];
    }
    if (categoryName.toLowerCase().includes('đồng hồ') || categoryName.toLowerCase().includes('tai nghe') || nameLower.includes('watch')) {
        return [
            { storage: '40mm (GPS)', priceDelta: 0 },
            { storage: '44mm (LTE)', priceDelta: 1500000 },
        ];
    }
    if (price >= 25000000 ||
        nameLower.includes('pro max') ||
        nameLower.includes('ultra') ||
        nameLower.includes('fold')) {
        return [
            { storage: '256GB', priceDelta: 0, ram: '12GB' },
            { storage: '512GB', priceDelta: 4500000, ram: '12GB' },
            { storage: '1TB', priceDelta: 10500000, ram: '16GB' },
        ];
    }
    if (price >= 14000000) {
        return [
            { storage: '128GB', priceDelta: 0, ram: '8GB' },
            { storage: '256GB', priceDelta: 2800000, ram: '8GB' },
            { storage: '512GB', priceDelta: 6500000, ram: '12GB' },
        ];
    }
    if (price >= 6000000) {
        return [
            { storage: '128GB', priceDelta: 0, ram: '8GB' },
            { storage: '256GB', priceDelta: 1400000, ram: '8GB' },
            { storage: '512GB', priceDelta: 3200000, ram: '12GB' },
        ];
    }
    return [
        { storage: '64GB', priceDelta: -500000, ram: '4GB' },
        { storage: '128GB', priceDelta: 0, ram: '6GB' },
        { storage: '256GB', priceDelta: 800000, ram: '8GB' },
    ];
}
async function main() {
    console.log('=== BAT DAU SCRIPT BO SUNG NHIEU VARIANT CHO TAT CA SAN PHAM ===');
    const products = await prisma.product.findMany({
        include: {
            brand: true,
            category: true,
            variants: true,
        },
        orderBy: { id: 'asc' },
    });
    console.log(`Tim thay ${products.length} san pham trong database.`);
    let totalVariantsCreatedOrUpdated = 0;
    for (const product of products) {
        const baseSalePrice = Number(product.salePrice || product.basePrice || 0);
        const baseOldPrice = Number(product.basePrice || baseSalePrice * 1.08);
        const brandCode = (product.brand?.name || 'SOC').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const existingColor = product.variants[0]?.color || 'Titan Tự Nhiên';
        const imageUrl = product.image || product.variants[0]?.imageUrl || '';
        const specs = getVariantSpecsForProduct(product);
        for (const spec of specs) {
            const variantPrice = Math.max(300000, Math.round(baseSalePrice + spec.priceDelta));
            const deltaRatio = baseSalePrice > 0 ? variantPrice / baseSalePrice : 1;
            const variantOldPrice = baseOldPrice > 0
                ? Math.round(baseOldPrice * deltaRatio)
                : Math.round(variantPrice * 1.08);
            const storageSlug = spec.storage.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const colorSlug = existingColor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const sku = `${brandCode}-${product.id}-${storageSlug}-${colorSlug}`;
            const variant = await prisma.productVariant.upsert({
                where: {
                    productId_color_storage: {
                        productId: product.id,
                        color: existingColor,
                        storage: spec.storage,
                    },
                },
                update: {
                    price: variantPrice,
                    oldPrice: variantOldPrice > variantPrice ? variantOldPrice : null,
                    sku,
                    ram: spec.ram || null,
                    imageUrl,
                },
                create: {
                    productId: product.id,
                    color: existingColor,
                    storage: spec.storage,
                    ram: spec.ram || null,
                    sku,
                    price: variantPrice,
                    oldPrice: variantOldPrice > variantPrice ? variantOldPrice : null,
                    imageUrl,
                },
            });
            await prisma.inventory.upsert({
                where: { variantId: variant.id },
                update: {
                    stock: 100,
                    status: 'IN_STOCK',
                },
                create: {
                    variantId: variant.id,
                    stock: 100,
                    reserved: 0,
                    status: 'IN_STOCK',
                },
            });
            totalVariantsCreatedOrUpdated++;
        }
    }
    const finalProductCount = await prisma.product.count();
    const finalVariantCount = await prisma.productVariant.count();
    console.log(`\n=== KET QUA HOAN TAT ===`);
    console.log(`Tong so san pham: ${finalProductCount}`);
    console.log(`Tong so bien the (variants) hien tai trong DB: ${finalVariantCount}`);
    console.log(`Trung binh bien the / san pham: ${(finalVariantCount / finalProductCount).toFixed(1)}`);
    const sample = await prisma.product.findFirst({
        where: {
            name: { contains: '17 Pro Max', mode: 'insensitive' },
        },
        include: {
            variants: { orderBy: { price: 'asc' } },
        },
    });
    if (sample) {
        console.log(`\nSample Flagship: ${sample.name}`);
        sample.variants.forEach((v) => {
            console.log(` - ID: ${v.id} | ${v.storage} | Color: ${v.color} | Gia: ${new Intl.NumberFormat('vi-VN').format(Number(v.price))}d | Cu: ${new Intl.NumberFormat('vi-VN').format(Number(v.oldPrice || 0))}d | SKU: ${v.sku}`);
        });
    }
}
main()
    .catch((e) => {
    console.error('Loi trong qua trinh seed variants:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed-variants.js.map