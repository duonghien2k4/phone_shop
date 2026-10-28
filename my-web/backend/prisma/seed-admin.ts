import 'dotenv/config';
import { PrismaClient, OrderStatus, PaymentMethod, PaymentStatus, StockStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedAdminData() {
  console.log('--- SEEDING EXTENDED ADMIN DATA ---');

  // 1. Ensure categories
  const categories = [
    { name: 'Điện thoại', slug: 'dien-thoai', description: 'Điện thoại di động thông minh các thương hiệu' },
    { name: 'Máy tính bảng', slug: 'may-tinh-bang', description: 'iPad, Galaxy Tab, Xiaomi Pad' },
    { name: 'Laptop', slug: 'laptop', description: 'MacBook, Dell, Asus, Lenovo' },
    { name: 'Đồng hồ thông minh', slug: 'dong-ho-thong-minh', description: 'Apple Watch, Galaxy Watch' },
    { name: 'Phụ kiện', slug: 'phu-kien', description: 'Cáp sạc, tai nghe, ốp lưng, pin dự phòng' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
  }
  console.log('✓ Categories seeded');

  // 2. Seed Vouchers
  const vouchers = [
    {
      code: 'GIAM50',
      description: 'Giảm 50.000đ cho đơn hàng từ 100.000đ',
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
      description: 'Giảm 2.000đ cho mọi đơn hàng thử nghiệm',
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
      description: 'Giảm 5% tối đa 1.500.000đ cho các dòng máy cao cấp',
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
      description: 'Mã chào mừng thành viên mới giảm 100.000đ',
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
      code: 'EXPIRED100',
      description: 'Mã khuyến mãi lễ đã hết hạn',
      discountType: 'FIXED',
      discountValue: 100000,
      minOrderValue: 1000000,
      maxDiscount: 100000,
      usageLimit: 50,
      usedCount: 50,
      isActive: false,
      startsAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const v of vouchers) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: v,
      create: v,
    });
  }
  console.log('✓ Vouchers seeded');

  // 3. Seed Orders & Payments
  const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  const sampleProducts = await prisma.product.findMany({
    take: 6,
    include: { variants: true },
  });

  if (customer && sampleProducts.length > 0) {
    const existingOrdersCount = await prisma.order.count();
    if (existingOrdersCount === 0) {
      const orderTemplates = [
        {
          status: OrderStatus.DELIVERED,
          paymentMethod: PaymentMethod.VNPAY,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            name: 'Nguyễn Văn An',
            phone: '0987654321',
            address: '123 Lê Lợi, Phường Bến Nghé, Quận 1',
            city: 'TP. Hồ Chí Minh',
          },
          voucherCode: 'GIAM50',
          discount: 50000,
          shippingFee: 0,
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          status: OrderStatus.SHIPPING,
          paymentMethod: PaymentMethod.COD,
          paymentStatus: PaymentStatus.PENDING,
          shippingAddress: {
            name: 'Trần Thị Mai',
            phone: '0912345678',
            address: '45 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy',
            city: 'Hà Nội',
          },
          voucherCode: null,
          discount: 0,
          shippingFee: 30000,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          status: OrderStatus.CONFIRMED,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          paymentStatus: PaymentStatus.PAID,
          shippingAddress: {
            name: 'Lê Hoàng Nam',
            phone: '0909112233',
            address: '78 Nguyễn Thị Minh Khai, Hải Châu',
            city: 'Đà Nẵng',
          },
          voucherCode: 'FLAGSHIPVIP',
          discount: 1500000,
          shippingFee: 0,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          status: OrderStatus.PENDING,
          paymentMethod: PaymentMethod.MOMO,
          paymentStatus: PaymentStatus.PENDING,
          shippingAddress: {
            name: 'Phạm Thuỳ Dung',
            phone: '0933445566',
            address: '22 Võ Văn Ngân, Thủ Đức',
            city: 'TP. Hồ Chí Minh',
          },
          voucherCode: 'SOC2K',
          discount: 2000,
          shippingFee: 30000,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          status: OrderStatus.CANCELLED,
          paymentMethod: PaymentMethod.COD,
          paymentStatus: PaymentStatus.FAILED,
          shippingAddress: {
            name: 'Đặng Quốc Huy',
            phone: '0977889900',
            address: '15 Phan Bội Châu, Hồng Bàng',
            city: 'Hải Phòng',
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
        const quantity = 1;
        const subtotal = unitPrice * quantity;
        const total = Math.max(0, subtotal + tpl.shippingFee - tpl.discount);

        const order = await prisma.order.create({
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
                  color: variant.color || 'Mặc định',
                  storage: variant.storage || 'Tiêu chuẩn',
                  imageUrl: variant.imageUrl || prod.image,
                  quantity,
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
                paidAt: tpl.paymentStatus === PaymentStatus.PAID ? tpl.createdAt : null,
              },
            },
          },
        });
      }
      console.log('✓ Orders and payments seeded');
    }
  }

  // 4. Seed Reviews
  const reviewsCount = await prisma.review.count();
  if (reviewsCount === 0 && customer && sampleProducts.length > 0) {
    const reviewsData = [
      {
        userId: customer.id,
        productId: sampleProducts[0].id,
        rating: 5,
        comment: 'Máy rất đẹp, đóng gói nguyên seal kỹ càng, nhân viên tư vấn nhiệt tình!',
        isVisible: true,
      },
      {
        userId: customer.id,
        productId: sampleProducts[1].id,
        rating: 4,
        comment: 'Giao hàng hỏa tốc trong 2 giờ đúng hẹn. Pin trâu xài mượt mà.',
        isVisible: true,
      },
      {
        userId: customer.id,
        productId: sampleProducts[2].id,
        rating: 5,
        comment: 'Chất lượng hàng chính hãng Sóc Mobile rất tin tưởng, bảo hành chu đáo.',
        isVisible: true,
      },
      {
        userId: customer.id,
        productId: sampleProducts[3].id,
        rating: 2,
        comment: 'Máy dùng tốt nhưng hộp có vết cấn nhẹ do đơn vị vận chuyển cẩu thả.',
        isVisible: false, // Ẩn để kiểm duyệt
      },
    ];

    for (const r of reviewsData) {
      await prisma.review.create({
        data: {
          ...r,
          imageUrls: [],
        },
      });
    }
    console.log('✓ Reviews seeded');
  }

  // 5. Seed AI Feedbacks & Bug Reports
  const aiCount = await prisma.aiFeedback.count();
  if (aiCount === 0) {
    await prisma.aiFeedback.createMany({
      data: [
        {
          userId: customer?.id,
          query: 'Tư vấn cho mình điện thoại chụp ảnh đẹp dưới 20 triệu',
          response: 'Chào bạn, trong tầm giá dưới 20 triệu, Sóc Mobile đề xuất iPhone 15 128GB hoặc Xiaomi 14 với cụm camera Leica cao cấp...',
          rating: 5,
          comment: 'Câu trả lời rất nhanh và đúng nhu cầu',
        },
        {
          userId: customer?.id,
          query: 'Cửa hàng có hỗ trợ trả góp 0% qua Home Credit không?',
          response: 'Dạ có, Sóc Mobile liên kết với Home Credit hỗ trợ trả góp 0% lãi suất với kỳ hạn linh hoạt 6, 9, 12 tháng...',
          rating: 5,
          comment: 'Rõ ràng, dễ hiểu',
        },
        {
          query: 'So sánh pin iPhone 16 Pro Max và Samsung Galaxy S24 Ultra',
          response: 'iPhone 16 Pro Max sở hữu viên pin 4685mAh tối ưu với chip A18 Pro, trong khi S24 Ultra trang bị pin 5000mAh sạc nhanh 45W...',
          rating: 4,
          comment: 'Khá chi tiết',
        },
      ],
    });
    console.log('✓ AI Feedbacks seeded');
  }

  const bugCount = await prisma.bugReport.count();
  if (bugCount === 0) {
    await prisma.bugReport.createMany({
      data: [
        {
          userId: customer?.id,
          title: 'Lỗi tải ảnh khi xem chi tiết sản phẩm trên iPhone cũ',
          description: 'Trang load hơi chậm khi mở modal trên Safari iOS 16.',
          status: 'IN_PROGRESS',
          imageUrls: [],
        },
        {
          userId: customer?.id,
          title: 'Gợi ý thêm phương thức chuyển khoản VietQR tĩnh',
          description: 'Khách hàng mong muốn quét mã VietQR tự điền số tiền chính xác.',
          status: 'RESOLVED',
          imageUrls: [],
        },
      ],
    });
    console.log('✓ Bug reports seeded');
  }

  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}

seedAdminData()
  .catch((e) => {
    console.error('Lỗi seed admin data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

