import {
  InstallmentDevice,
  FinancePartner,
  ShowroomStore,
  CustomerKycInfo,
  LoanCalculation,
  PaymentScheduleItem,
} from '@/types/installment-flow';

export const MOCK_DEVICES: InstallmentDevice[] = [
  {
    id: 'iphone-16-pro-max-256-desert',
    name: 'iPhone 16 Pro Max',
    subname: '256GB Titan Sa Mạc',
    version: 'Chính hãng Apple VN/A',
    color: 'Titan Sa Mạc',
    colorName: 'Desert Titanium',
    storage: '256GB',
    originalPrice: 34990000,
    price: 32490000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW_ypJL5jXr6xH_DDMDdOPwfcOYLQAKcoYKQdkTopoNWDmTR2dfXTqgUVkQKuuFVWZDK2T0Yu-OXOpqA3g4vUHq3QkeAfy7eEjjXs8lJwKXnM2ZT764KAohC-IXCRMK8NlYDwGqu36bMHLxEHHEX9BTgD4C2C3tq4DaqJEhXiWSh0WtQxBIpPUSPJUe65-C5wmjYMrO-mRfC4WiNxyCRWTlQHZFSDYOeyhMqG99isFT5gX3eL11f7uJg',
    tag: 'Chính hãng Apple VN/A',
    badge: 'Gói Trả Góp 0%',
  },
  {
    id: 'iphone-16-pro-max-512-desert',
    name: 'iPhone 16 Pro Max',
    subname: '512GB Titan Sa Mạc',
    version: 'Chính hãng Apple VN/A',
    color: 'Titan Sa Mạc',
    colorName: 'Desert Titanium',
    storage: '512GB',
    originalPrice: 40990000,
    price: 37990000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW_ypJL5jXr6xH_DDMDdOPwfcOYLQAKcoYKQdkTopoNWDmTR2dfXTqgUVkQKuuFVWZDK2T0Yu-OXOpqA3g4vUHq3QkeAfy7eEjjXs8lJwKXnM2ZT764KAohC-IXCRMK8NlYDwGqu36bMHLxEHHEX9BTgD4C2C3tq4DaqJEhXiWSh0WtQxBIpPUSPJUe65-C5wmjYMrO-mRfC4WiNxyCRWTlQHZFSDYOeyhMqG99isFT5gX3eL11f7uJg',
    tag: 'Chính hãng Apple VN/A',
    badge: 'Gói Trả Góp 0%',
  },
  {
    id: 'iphone-16-pro-256-natural',
    name: 'iPhone 16 Pro',
    subname: '256GB Titan Tự Nhiên',
    version: 'Chính hãng Apple VN/A',
    color: 'Titan Tự Nhiên',
    colorName: 'Natural Titanium',
    storage: '256GB',
    originalPrice: 31990000,
    price: 28990000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf49J5Kfy0Dsr7LxXPoArQea2QIw13akNn2m8bdpPBa_edrciykpoXrNUiuMaGR1A4Y34oUiERBNtWeY8ZuZmXO_Se8f0P58vyAwJXLQ61L0QmRPxkBainaXvCpI7nSNNZewYBEhSM8885ZfRz-57-HmNG89zeWEnYPI52BHeRatZiGFV9n4uWjpW114d2I3MZ5AMwIyQFxdXnD8fGqFB95YunxkCqVpgPnWtqYaV3EmCWtx4nAF7GyQ',
    tag: 'Chính hãng Apple VN/A',
    badge: 'Gói Trả Góp 0%',
  },
  {
    id: 'samsung-s25-ultra-256',
    name: 'Galaxy S25 Ultra',
    subname: '256GB AI Phone',
    version: 'Chính hãng Samsung VN',
    color: 'Titan Xám',
    colorName: 'Titanium Gray',
    storage: '256GB',
    originalPrice: 33990000,
    price: 29990000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBo0UfbSv6woyPm9N1LWazTDW3D9NbBA8nuqvyOLHWPcjoKtyCTZkBeOOoP5fT4KHjbMGrkDQ_KBprG7BUyDeRw96QU_zfK55QetEUvy3pk1-fYJ5Wo9DmfoHA0cYaontQ2KKeujAhE7RGucpx3Uw_JxBdr-zkkxH-V53aWPuycc9Cl2pSFhYb_2s9rU_FriCsVs7YDNSVNCh4_rE2iPvahpNKxnHaNi53QiX1A1PKlIep54MorR9bRzw',
    tag: 'Chính hãng Samsung VN',
    badge: 'Trả góp 0% AI',
  },
  {
    id: 'xiaomi-15-pro-512',
    name: 'Xiaomi 15 Pro',
    subname: '512GB Leica Cam',
    version: 'Chính hãng DGW',
    color: 'Xanh Titan',
    colorName: 'Titanium Green',
    storage: '512GB',
    originalPrice: 24990000,
    price: 22990000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEzOHMM7SDzX9hddf1n7px8Kh16v-fQvKv5cmW62OSEFW3lazq7wN5nfuXf9FsMiYErboJLLQXx6fmH8RxqdYGQedeyBeO-SnELo4muhTT7rE-tdw91OeorrgU1FmEOXXBoWVWrrTQjylQm5KSacD31xSX5ygBz1bvW0B26GKPRydFUW2nl-oBGsAgh3IGTZVm-crdrTmeOfXyCanXCoGLEuIwEju4ODYHsUPDvEcSI97hvM83AtuViQ',
    tag: 'Chính hãng DGW',
    badge: 'Gói Trả Góp 0%',
  },
];

export const MOCK_FINANCE_PARTNERS: FinancePartner[] = [
  {
    id: 'home-credit',
    name: 'Home Credit',
    badge: 'Khuyên dùng',
    badgeType: 'coral',
    recommended: true,
    approvalRate: 'Duyệt 98%',
    interestRate: 0,
    partnerMonthlyFee: 0,
    partnerMonthlyFeeLabel: 'Phí bảo hiểm khoản vay',
    subtext: 'Ưu đãi lãi suất 0% • Phí bảo hiểm khoản vay: 0đ • Hỗ trợ CCCD toàn quốc',
    breakdownNote: 'Lãi: 0đ',
  },
  {
    id: 'shinhan-finance',
    name: 'Shinhan Finance',
    badge: 'Quà 500k',
    badgeType: 'blue',
    recommended: false,
    approvalRate: 'Duyệt 95%',
    interestRate: 0,
    partnerMonthlyFee: 4000,
    partnerMonthlyFeeLabel: 'Phí tiện ích',
    subtext: 'Lãi suất 0% • Tặng voucher phụ kiện 500k khi hoàn tất hợp đồng',
    breakdownNote: 'Phí tiện ích: 4.000đ',
  },
  {
    id: 'fe-credit',
    name: 'FE Credit',
    badge: 'Duyệt 3 phút',
    badgeType: 'gray',
    recommended: false,
    approvalRate: 'Duyệt 92%',
    interestRate: 0,
    partnerMonthlyFee: 24000,
    partnerMonthlyFeeLabel: 'Phí thu hộ',
    subtext: 'Thẩm định hoàn toàn bằng AI tự động • Không gọi người thân xác minh',
    breakdownNote: 'Phí thu hộ: 24.000đ',
  },
  {
    id: 'mcredit',
    name: 'MCredit (MB Bank)',
    badge: 'Hỗ trợ nợ chú ý',
    badgeType: 'outline',
    recommended: false,
    approvalRate: 'Duyệt 89%',
    interestRate: 0,
    partnerMonthlyFee: 44000,
    partnerMonthlyFeeLabel: 'Phí quản lý',
    subtext: 'Chính sách linh hoạt cho khách hàng có lịch sử nợ chú ý nhẹ nhóm 1',
    breakdownNote: 'Phí quản lý: 44.000đ',
  },
];

export const MOCK_SHOWROOMS: ShowroomStore[] = [
  {
    id: 'duy-tan',
    name: 'Showroom Sóc Mobile Flagship Duy Tân',
    address: '86 Phố Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
    city: 'Hà Nội',
    readyTime: 'Hôm nay lúc 15:30 (Sau 30 phút)',
    isFlagship: true,
  },
  {
    id: 'cau-giay',
    name: 'Showroom Sóc Mobile 136 Cầu Giấy',
    address: '136 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội',
    city: 'Hà Nội',
    readyTime: 'Hôm nay lúc 15:45 (Sau 45 phút)',
  },
  {
    id: 'nguyen-thi-minh-khai',
    name: 'Showroom Sóc Mobile 142 Nguyễn Thị Minh Khai',
    address: '142 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP.HCM',
    city: 'TP.HCM',
    readyTime: 'Hôm nay lúc 16:00 (Sau 60 phút)',
  },
  {
    id: 'tran-hung-dao',
    name: 'Showroom Sóc Mobile 248 Trần Hưng Đạo',
    address: '248 Trần Hưng Đạo, Phường Cô Giang, Quận 1, TP.HCM',
    city: 'TP.HCM',
    readyTime: 'Hôm nay lúc 16:15 (Sau 75 phút)',
  },
];

export const MOCK_INITIAL_KYC: CustomerKycInfo = {
  fullName: '',
  cccdNumber: '',
  dob: '',
  gender: '',
  email: '',
  phone: '',
  permanentAddress: '',
  currentAddress: '',
  jobTitle: '',
  monthlyIncome: '',
  companyName: '',
  refRelation: '',
  refName: '',
  refPhone: '',
  deliveryMethod: 'shop',
  pickupStoreId: 'duy-tan',
  agreeConsent: false,
};

// ================= DATASOURCE API-READY INTERFACE =================
export function getInstallmentDevices(): InstallmentDevice[] {
  return MOCK_DEVICES;
}

export function getInstallmentDeviceById(id: string): InstallmentDevice | undefined {
  return MOCK_DEVICES.find((d) => d.id === id);
}

export function getFinancePartners(): FinancePartner[] {
  return MOCK_FINANCE_PARTNERS;
}

export function getFinancePartnerById(id: string): FinancePartner | undefined {
  return MOCK_FINANCE_PARTNERS.find((p) => p.id === id);
}

export function getShowrooms(): ShowroomStore[] {
  return MOCK_SHOWROOMS;
}

export function getShowroomById(id: string): ShowroomStore | undefined {
  return MOCK_SHOWROOMS.find((s) => s.id === id);
}

export function getDefaultKycInfo(): CustomerKycInfo {
  return { ...MOCK_INITIAL_KYC };
}

// ================= CALCULATION & FORMATTING HELPERS =================
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + 'đ';
}

export function formatVNDText(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}

export function calculateLoan(
  device: InstallmentDevice,
  prepaidPercent: number,
  tenureMonths: number,
  partner: FinancePartner,
  includeWarranty = false
): LoanCalculation {
  const prepaidAmount = Math.round((device.price * prepaidPercent) / 100);
  const loanAmount = device.price - prepaidAmount;
  const monthlyPrincipal = tenureMonths > 0 ? Math.round(loanAmount / tenureMonths) : 0;
  const monthlyPartnerFee = partner.partnerMonthlyFee;
  const monthlyInsuranceFee = includeWarranty ? 150000 : 0;
  const totalMonthlyPayment = monthlyPrincipal + monthlyPartnerFee + monthlyInsuranceFee;
  const differenceAmount = (totalMonthlyPayment * tenureMonths + prepaidAmount) - device.price;

  // Generate payment schedule
  const schedule: PaymentScheduleItem[] = [];
  const currentDate = new Date();
  for (let i = 1; i <= tenureMonths; i++) {
    const payDate = new Date(currentDate);
    payDate.setMonth(currentDate.getMonth() + i);
    const day = 15;
    const month = String(payDate.getMonth() + 1).padStart(2, '0');
    const year = payDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    schedule.push({
      period: `Kỳ ${String(i).padStart(2, '0')}`,
      dueDate: formattedDate,
      principal: monthlyPrincipal,
      interest: 0,
      fee: monthlyPartnerFee,
      total: totalMonthlyPayment,
      isFirst: i === 1,
    });
  }

  return {
    devicePrice: device.price,
    originalPrice: device.originalPrice,
    prepaidPercent,
    prepaidAmount,
    loanAmount,
    tenureMonths,
    monthlyPrincipal,
    monthlyPartnerFee,
    monthlyInsuranceFee,
    totalMonthlyPayment,
    differenceAmount: Math.max(0, differenceAmount),
    schedule,
  };
}
