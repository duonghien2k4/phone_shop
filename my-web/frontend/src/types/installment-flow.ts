export interface InstallmentDevice {
  id: string;
  name: string;
  subname: string;
  version: string;
  color: string;
  colorName: string;
  storage: string;
  originalPrice: number;
  price: number;
  image: string;
  tag: string;
  badge: string;
  badgeColor?: string;
}

export interface FinancePartner {
  id: string;
  name: string;
  badge: string;
  badgeType: 'coral' | 'blue' | 'gray' | 'outline';
  recommended: boolean;
  approvalRate: string;
  interestRate: number; // 0%
  partnerMonthlyFee: number; // e.g. 0, 4000, 24000, 44000
  partnerMonthlyFeeLabel: string; // e.g. 'Phí tiện ích', 'Phí thu hộ', 'Phí quản lý'
  subtext: string;
  breakdownNote: string;
}

export interface ShowroomStore {
  id: string;
  name: string;
  address: string;
  city: string;
  readyTime: string;
  isFlagship?: boolean;
}

export interface CustomerKycInfo {
  fullName: string;
  cccdNumber: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  phone: string;
  email: string;
  permanentAddress: string;
  currentAddress: string;
  jobTitle: string;
  monthlyIncome: string;
  companyName: string;
  refRelation: string;
  refName: string;
  refPhone: string;
  deliveryMethod: 'shop' | 'home';
  pickupStoreId: string;
  agreeConsent: boolean;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  signatureUrl?: string;
}

export interface PaymentScheduleItem {
  period: string;
  dueDate: string;
  principal: number;
  interest: number;
  fee: number;
  total: number;
  isFirst?: boolean;
}

export interface LoanCalculation {
  devicePrice: number;
  originalPrice: number;
  prepaidPercent: number;
  prepaidAmount: number;
  loanAmount: number;
  tenureMonths: number;
  monthlyPrincipal: number;
  monthlyPartnerFee: number;
  monthlyInsuranceFee: number;
  totalMonthlyPayment: number;
  differenceAmount: number;
  schedule: PaymentScheduleItem[];
}

