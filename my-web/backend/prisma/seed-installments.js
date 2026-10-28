require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Installment Applications...');
  const partners = await prisma.financePartner.findMany();
  console.log('Found partners:', partners.map(p => ({ id: p.id, name: p.name })));

  if (partners.length === 0) {
    console.log('No partners found, skipping seed');
    return;
  }

  const feCredit = partners.find(p => p.id.includes('fe')) || partners[0];
  const hdSaison = partners.find(p => p.id.includes('hd')) || partners[1] || partners[0];
  const homeCredit = partners.find(p => p.id.includes('home')) || partners[2] || partners[0];
  const shinhan = partners.find(p => p.id.includes('shinhan')) || partners[0];

  const existingCount = await prisma.installmentApplication.count();
  if (existingCount > 0) {
    console.log(`Already have ${existingCount} applications. Skipping seed to preserve data.`);
    return;
  }

  const sampleApps = [
    {
      applicationCode: 'INS-2026-108234',
      financePartnerId: feCredit.id,
      productName: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên',
      productPrice: 29990000,
      prepaidPercent: 20,
      downPayment: 5998000,
      financedAmount: 23992000,
      termMonths: 12,
      monthlyPayment: 2185000,
      status: 'SUBMITTED',
      fullName: 'Nguyễn Văn An',
      citizenId: '001095012345',
      dateOfBirth: '1995-05-12',
      gender: 'Nam',
      phoneNumber: '0901234567',
      email: 'an.nguyen95@gmail.com',
      permanentAddress: 'Phường Hàng Bông, Quận Hoàn Kiếm, Hà Nội',
      currentAddress: 'Số 45 Tràng Thi, Hoàn Kiếm, Hà Nội',
      jobTitle: 'Kỹ sư phần mềm',
      monthlyIncome: '25-35 triệu',
      companyName: 'Công ty TNHH Giải pháp Số FPT',
      refRelation: 'Đồng nghiệp',
      refName: 'Trần Minh Đức',
      refPhone: '0912345678',
      deliveryMethod: 'shop',
      pickupStoreId: 'STORE-HN-01',
      idCardFrontUrl: '/uploads/installment/cccd-front-demo.png',
      idCardBackUrl: '/uploads/installment/cccd-back-demo.png',
      submittedAt: new Date(Date.now() - 3600000 * 2),
      history: [
        {
          fromStatus: null,
          toStatus: 'SUBMITTED',
          action: 'CUSTOMER_SUBMIT',
          reason: 'Khách hàng gửi hồ sơ đăng ký trả góp qua website',
          actorType: 'CUSTOMER',
        },
      ],
    },
    {
      applicationCode: 'INS-2026-108235',
      financePartnerId: hdSaison.id,
      productName: 'Samsung Galaxy S24 Ultra 512GB Xám Titan',
      productPrice: 31990000,
      prepaidPercent: 30,
      downPayment: 9597000,
      financedAmount: 22393000,
      termMonths: 9,
      monthlyPayment: 2680000,
      status: 'UNDER_REVIEW',
      fullName: 'Trần Thị Thu Hà',
      citizenId: '038198005678',
      dateOfBirth: '1998-10-20',
      gender: 'Nữ',
      phoneNumber: '0938456789',
      email: 'thuha.tran@outlook.com',
      permanentAddress: 'Xã Phú Cường, Sóc Sơn, Hà Nội',
      currentAddress: 'Số 12 Chùa Bộc, Đống Đa, Hà Nội',
      jobTitle: 'Chuyên viên Marketing',
      monthlyIncome: '18-22 triệu',
      companyName: 'VNG Corporation chi nhánh HN',
      refRelation: 'Chị gái',
      refName: 'Trần Thị Mai',
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
          reason: 'Khách hàng gửi hồ sơ đăng ký trả góp',
          actorType: 'CUSTOMER',
          createdAt: new Date(Date.now() - 3600000 * 8),
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_REVIEW',
          action: 'STAFF_CLAIM',
          reason: 'Nhân viên thẩm định đã tiếp nhận và đang xác minh thông tin giấy tờ',
          actorType: 'STAFF',
          createdAt: new Date(Date.now() - 3600000 * 4),
        },
      ],
    },
    {
      applicationCode: 'INS-2026-108236',
      financePartnerId: homeCredit.id,
      productName: 'Xiaomi 14 Ultra 512GB Đen',
      productPrice: 27490000,
      prepaidPercent: 20,
      downPayment: 5498000,
      financedAmount: 21992000,
      termMonths: 6,
      monthlyPayment: 3880000,
      status: 'NEED_MORE_INFO',
      additionalInfoNotes: 'Ảnh mặt sau CCCD bị chói sáng mất số định danh.\n- Hạng mục cần bổ sung: Mặt sau CCCD rõ nét, Xác nhận địa chỉ tạm trú\n- Ghi chú: Chụp góc vuông, không lóa đèn flash.',
      fullName: 'Lê Hoàng Nam',
      citizenId: '040092008765',
      dateOfBirth: '1992-03-15',
      gender: 'Nam',
      phoneNumber: '0977889900',
      email: 'nam.lehoang@gmail.com',
      permanentAddress: 'Phường Tân Định, Quận 1, TP. Hồ Chí Minh',
      currentAddress: 'Số 88 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
      jobTitle: 'Kế toán trưởng',
      monthlyIncome: '30-40 triệu',
      companyName: 'Công ty Cổ phần Thực phẩm Sài Gòn',
      refRelation: 'Bạn bè',
      refName: 'Đặng Tuấn Anh',
      refPhone: '0966554433',
      deliveryMethod: 'shop',
      pickupStoreId: 'STORE-HCM-01',
      idCardFrontUrl: '/uploads/installment/cccd-front-demo.png',
      idCardBackUrl: '/uploads/installment/cccd-back-demo.png',
      submittedAt: new Date(Date.now() - 3600000 * 24),
      reviewedAt: new Date(Date.now() - 3600000 * 18),
      history: [
        {
          fromStatus: null,
          toStatus: 'SUBMITTED',
          action: 'CUSTOMER_SUBMIT',
          reason: 'Khách hàng gửi hồ sơ trực tuyến',
          actorType: 'CUSTOMER',
          createdAt: new Date(Date.now() - 3600000 * 24),
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_REVIEW',
          action: 'STAFF_CLAIM',
          reason: 'Nhân viên bắt đầu thẩm định KYC',
          actorType: 'STAFF',
          createdAt: new Date(Date.now() - 3600000 * 20),
        },
        {
          fromStatus: 'UNDER_REVIEW',
          toStatus: 'NEED_MORE_INFO',
          action: 'STAFF_REQUEST_INFO',
          reason: 'Ảnh mặt sau CCCD bị chói sáng mất số định danh',
          metadata: { checklist: ['Mặt sau CCCD rõ nét', 'Xác nhận địa chỉ tạm trú'] },
          actorType: 'STAFF',
          createdAt: new Date(Date.now() - 3600000 * 18),
        },
      ],
    },
    {
      applicationCode: 'INS-2026-108237',
      financePartnerId: shinhan.id,
      productName: 'iPhone 15 Plus 128GB Xanh Dương',
      productPrice: 22490000,
      prepaidPercent: 40,
      downPayment: 8996000,
      financedAmount: 13494000,
      termMonths: 12,
      monthlyPayment: 1245000,
      status: 'PARTNER_REVIEW',
      fullName: 'Phạm Minh Quang',
      citizenId: '031097003456',
      dateOfBirth: '1997-08-08',
      gender: 'Nam',
      phoneNumber: '0918765432',
      email: 'minhquang.pham@gmail.com',
      permanentAddress: 'Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
      currentAddress: 'Chung cư Masteri Thảo Điền, Quận 2, TP.HCM',
      jobTitle: 'Kiến trúc sư',
      monthlyIncome: '28 triệu',
      companyName: 'Công ty Tư vấn Kiến trúc Không Gian Xanh',
      refRelation: 'Đồng nghiệp',
      refName: 'Hoàng Hải Đăng',
      refPhone: '0909887766',
      deliveryMethod: 'shop',
      pickupStoreId: 'STORE-HCM-02',
      idCardFrontUrl: '/uploads/installment/cccd-front-demo.png',
      idCardBackUrl: '/uploads/installment/cccd-back-demo.png',
      submittedAt: new Date(Date.now() - 3600000 * 30),
      reviewedAt: new Date(Date.now() - 3600000 * 12),
      history: [
        {
          fromStatus: null,
          toStatus: 'SUBMITTED',
          action: 'CUSTOMER_SUBMIT',
          reason: 'Khách hàng gửi hồ sơ',
          actorType: 'CUSTOMER',
          createdAt: new Date(Date.now() - 3600000 * 30),
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_REVIEW',
          action: 'STAFF_CLAIM',
          reason: 'Đã hoàn thành kiểm tra hồ sơ sơ bộ',
          actorType: 'STAFF',
          createdAt: new Date(Date.now() - 3600000 * 20),
        },
        {
          fromStatus: 'UNDER_REVIEW',
          toStatus: 'PARTNER_REVIEW',
          action: 'SUBMIT_TO_PARTNER',
          reason: 'Hồ sơ đầy đủ, hợp lệ, đã chuyển sang Shinhan Finance để duyệt hạn mức tín dụng',
          actorType: 'STAFF',
          createdAt: new Date(Date.now() - 3600000 * 12),
        },
      ],
    },
    {
      applicationCode: 'INS-2026-108238',
      financePartnerId: feCredit.id,
      productName: 'iPhone 15 Pro 128GB Titan Tự Nhiên',
      productPrice: 25490000,
      prepaidPercent: 20,
      downPayment: 5098000,
      financedAmount: 20392000,
      termMonths: 12,
      monthlyPayment: 1875000,
      status: 'APPROVED',
      decisionSource: 'PARTNER',
      decisionReason: 'Điểm tín dụng CIC Hạng 1, đối tác FE Credit phê duyệt 100% hạn mức yêu cầu.',
      referenceCode: 'PART-FE-982143',
      fullName: 'Vũ Quốc Kiên',
      citizenId: '001099001234',
      dateOfBirth: '1999-11-14',
      gender: 'Nam',
      phoneNumber: '0988776655',
      email: 'kienvu.developer@gmail.com',
      permanentAddress: 'Cầu Giấy, Hà Nội',
      currentAddress: 'Số 18 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
      jobTitle: 'Kỹ sư Trí tuệ nhân tạo',
      monthlyIncome: '35 triệu',
      companyName: 'Tập đoàn Công nghệ Viễn thông Viettel',
      refRelation: 'Đồng nghiệp',
      refName: 'Nguyễn Tiến Đạt',
      refPhone: '0971239876',
      deliveryMethod: 'shop',
      pickupStoreId: 'STORE-HN-01',
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
          reason: 'Khách hàng gửi hồ sơ trực tuyến',
          actorType: 'CUSTOMER',
          createdAt: new Date(Date.now() - 3600000 * 48),
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_REVIEW',
          action: 'STAFF_CLAIM',
          reason: 'Nhân viên thẩm định tiếp nhận hồ sơ',
          actorType: 'STAFF',
          createdAt: new Date(Date.now() - 3600000 * 36),
        },
        {
          fromStatus: 'UNDER_REVIEW',
          toStatus: 'PARTNER_REVIEW',
          action: 'SUBMIT_TO_PARTNER',
          reason: 'Chuyển hồ sơ sang FE Credit để xét duyệt hạn mức',
          actorType: 'STAFF',
          createdAt: new Date(Date.now() - 3600000 * 24),
        },
        {
          fromStatus: 'PARTNER_REVIEW',
          toStatus: 'APPROVED',
          action: 'RECORD_APPROVAL',
          reason: 'Điểm tín dụng CIC Hạng 1, đối tác FE Credit phê duyệt 100% hạn mức yêu cầu.',
          metadata: { decisionSource: 'PARTNER', referenceCode: 'PART-FE-982143', simulated: true },
          actorType: 'STAFF',
          createdAt: new Date(Date.now() - 3600000 * 10),
        },
      ],
    },
    {
      applicationCode: 'INS-2026-108239',
      financePartnerId: hdSaison.id,
      productName: 'OPPO Find X7 Ultra 256GB Nâu Da',
      productPrice: 21990000,
      prepaidPercent: 20,
      downPayment: 4398000,
      financedAmount: 17592000,
      termMonths: 6,
      monthlyPayment: 3120000,
      status: 'REJECTED',
      decisionSource: 'INTERNAL',
      decisionReason: 'Thông tin CCCD và thông tin số điện thoại tham chiếu không đồng nhất, không liên lạc được số tham chiếu.',
      referenceCode: 'INT-REJ-202601',
      fullName: 'Hoàng Đình Trọng',
      citizenId: '025091004567',
      dateOfBirth: '1991-06-25',
      gender: 'Nam',
      phoneNumber: '0945671234',
      email: 'trong.hoang@gmail.com',
      permanentAddress: 'TP. Biên Hòa, Đồng Nai',
      currentAddress: 'Đường Nguyễn Ái Quốc, Biên Hòa, Đồng Nai',
      jobTitle: 'Kinh doanh tự do',
      monthlyIncome: '15 triệu',
      companyName: 'Cá nhân',
      refRelation: 'Bạn bè',
      refName: 'Lê Văn B',
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
          reason: 'Khách hàng gửi hồ sơ',
          actorType: 'CUSTOMER',
          createdAt: new Date(Date.now() - 3600000 * 72),
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_REVIEW',
          action: 'STAFF_CLAIM',
          reason: 'Tiếp nhận thẩm định thông tin liên hệ',
          actorType: 'STAFF',
          createdAt: new Date(Date.now() - 3600000 * 60),
        },
        {
          fromStatus: 'UNDER_REVIEW',
          toStatus: 'REJECTED',
          action: 'RECORD_REJECTION',
          reason: 'Thông tin CCCD và thông tin số điện thoại tham chiếu không đồng nhất, không liên lạc được số tham chiếu.',
          metadata: { decisionSource: 'INTERNAL', referenceCode: 'INT-REJ-202601' },
          actorType: 'STAFF',
          createdAt: new Date(Date.now() - 3600000 * 50),
        },
      ],
    },
  ];

  for (const app of sampleApps) {
    const { history, ...appData } = app;
    const created = await prisma.installmentApplication.create({
      data: appData,
    });
    console.log(`Created app ${created.applicationCode} with status ${created.status}`);
    for (const h of history) {
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: created.id,
          ...h,
        },
      });
    }
  }

  console.log('Seeded installment applications successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

