import { api } from '@/lib/api-client';

export interface Voucher {
  id: number;
  code: string;
  description: string | null;
  discountType: 'FIXED' | 'PERCENT';
  discountValue: number | string;
  minOrderValue: number | string;
  maxDiscount: number | string | null;
  expiresAt: string | null;
}

interface AvailableVouchersResponse {
  items: Voucher[];
}

export const voucherService = {
  getAvailableVouchers: async (): Promise<Voucher[]> => {
    const response = await api.get<AvailableVouchersResponse>('/vouchers/available');
    return response.items;
  },
};
