import { api } from '@/lib/api-client';
import {
  FinancePartner,
  ShowroomStore,
  InstallmentDevice,
} from '@/types/installment-flow';
import {
  MOCK_FINANCE_PARTNERS,
  MOCK_SHOWROOMS,
  MOCK_DEVICES,
} from '@/data/mock-installment-flow';

export interface InstallmentHistoryItem {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  action: string;
  reason: string | null;
  actorType: 'CUSTOMER' | 'STAFF' | 'SYSTEM';
  actorId?: number | null;
  metadata?: any;
  createdAt: string;
}

export interface CustomerInstallmentApplication {
  id: number;
  applicationCode: string;
  financePartnerId: string;
  orderId?: number | null;
  productId?: number | null;
  productVariantId?: number | null;
  productName: string;
  productPrice: number;
  prepaidPercent: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  monthlyPayment: number;
  status:
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'NEED_MORE_INFO'
    | 'PARTNER_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED';
  decisionSource?: 'INTERNAL' | 'PARTNER' | null;
  decisionReason?: string | null;
  referenceCode?: string | null;
  isSimulated: boolean;

  fullName: string;
  citizenId: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  permanentAddress?: string;
  currentAddress?: string;
  jobTitle?: string;
  monthlyIncome?: string;
  companyName?: string;
  refRelation?: string;
  refName?: string;
  refPhone?: string;
  deliveryMethod?: string;
  pickupStoreId?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  signatureUrl?: string;
  additionalInfoNotes?: string;
  customerResponseNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  decidedAt?: string;
  createdAt: string;
  financePartner?: FinancePartner;
  statusHistory?: InstallmentHistoryItem[];
}

export interface InstallmentOtpChallenge {
  challengeId: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

export interface CreateInstallmentApplicationRequest {
  otpChallengeId: string;
  financePartnerId: string;
  productId?: number;
  productVariantId?: number;
  orderId?: number;
  productName: string;
  productPrice: number;
  prepaidPercent: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  monthlyPayment: number;
  fullName: string;
  citizenId: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber: string;
  email: string;
  permanentAddress?: string;
  currentAddress?: string;
  jobTitle?: string;
  monthlyIncome?: string;
  companyName?: string;
  refRelation?: string;
  refName?: string;
  refPhone?: string;
  deliveryMethod?: string;
  pickupStoreId?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  signatureUrl?: string;
}

export const installmentService = {
  getPartners: async (): Promise<FinancePartner[]> => {
    try {
      const data = await api.get<FinancePartner[]>('/installment/partners', {
        skipAuth: true,
      });
      return Array.isArray(data) && data.length > 0 ? data : MOCK_FINANCE_PARTNERS;
    } catch {
      return MOCK_FINANCE_PARTNERS;
    }
  },

  getShowrooms: async (): Promise<ShowroomStore[]> => {
    try {
      const data = await api.get<ShowroomStore[]>('/installment/showrooms', {
        skipAuth: true,
      });
      return Array.isArray(data) && data.length > 0 ? data : MOCK_SHOWROOMS;
    } catch {
      return MOCK_SHOWROOMS;
    }
  },

  getDevices: async (): Promise<InstallmentDevice[]> => {
    try {
      const data = await api.get<InstallmentDevice[]>('/installment/devices', {
        skipAuth: true,
      });
      return Array.isArray(data) && data.length > 0 ? data : MOCK_DEVICES;
    } catch {
      return MOCK_DEVICES;
    }
  },

  uploadFile: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/installment/upload', formData, {
      skipAuth: true,
    });
  },

  uploadBase64: async (base64: string, prefix?: string): Promise<{ url: string }> => {
    return api.post<{ url: string }>(
      '/installment/upload',
      { base64, prefix },
      { skipAuth: true },
    );
  },

  sendOtp: async (email: string): Promise<InstallmentOtpChallenge> => {
    return api.post<InstallmentOtpChallenge>('/installment/otp/send', {
      email: email.trim(),
    });
  },

  verifyOtp: async (
    challengeId: string,
    email: string,
    code: string,
  ): Promise<{ verified: true }> => {
    return api.post<{ verified: true }>('/installment/otp/verify', {
      challengeId,
      email: email.trim(),
      code,
    });
  },

  createApplication: async (
    data: CreateInstallmentApplicationRequest,
  ): Promise<CustomerInstallmentApplication> => {
    return api.post<CustomerInstallmentApplication>('/installment/applications', data);
  },

  getMyApplications: async (): Promise<CustomerInstallmentApplication[]> => {
    return api.get<CustomerInstallmentApplication[]>('/installment/applications/my');
  },

  trackApplication: async (
    codeOrId: string,
  ): Promise<CustomerInstallmentApplication> => {
    return api.get<CustomerInstallmentApplication>(
      `/installment/applications/track/${encodeURIComponent(codeOrId)}`,
      { skipAuth: true },
    );
  },

  resubmitApplication: async (
    id: number,
    data: {
      notes: string;
      idCardFrontUrl?: string;
      idCardBackUrl?: string;
      signatureUrl?: string;
      permanentAddress?: string;
      currentAddress?: string;
      monthlyIncome?: string;
      companyName?: string;
      refPhone?: string;
    },
  ): Promise<CustomerInstallmentApplication> => {
    return api.post<CustomerInstallmentApplication>(
      `/installment/applications/${id}/resubmit`,
      data,
    );
  },

  cancelApplication: async (
    id: number,
    reason?: string,
  ): Promise<CustomerInstallmentApplication> => {
    return api.post<CustomerInstallmentApplication>(
      `/installment/applications/${id}/cancel`,
      { reason },
    );
  },
};
