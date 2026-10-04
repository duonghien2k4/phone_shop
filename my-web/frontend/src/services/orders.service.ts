import { api } from '@/lib/api-client';
import type { PaymentMethodType } from '@/types/order';

export interface CreateOrderRequest {
  shippingFee: number;
  discount: number;
  voucherCode?: string | null;
  note?: string;
  paymentMethod: 'COD' | 'BANK_TRANSFER';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    fulfillmentMode: 'HOME_DELIVERY' | 'STORE_PICKUP';
    storeAddress?: string;
    appointmentTime?: string;
  };
}

export const ordersService = {
  create: (request: CreateOrderRequest) => api.post<{ id: number }>('/orders', request),
};

export function toOrderPaymentMethod(method: PaymentMethodType): CreateOrderRequest['paymentMethod'] {
  return method === 'COD' || method === 'PAY_AT_STORE' ? 'COD' : 'BANK_TRANSFER';
}