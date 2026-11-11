import { api } from '@/lib/api-client';
import type { PaymentMethodType } from '@/types/order';

export interface CreateOrderRequest {
  variantIds?: number[];
  shippingFee: number;
  discount: number;
  voucherCode?: string | null;
  note?: string;
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'STRIPE';
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
  create: (request: CreateOrderRequest, accessToken: string) =>
    api.post<{ id: number }>('/orders', request, {
      headers: { Authorization: 'Bearer ' + accessToken },
    }),

  createStripeCheckout: (orderId: number, accessToken: string) =>
    api.post<{ checkoutUrl: string | null }>(
      `/orders/${orderId}/stripe-checkout`,
      undefined,
      { headers: { Authorization: 'Bearer ' + accessToken } },
    ),
};

export function toOrderPaymentMethod(
  method: PaymentMethodType,
): CreateOrderRequest['paymentMethod'] {
  if (method === 'STRIPE') return 'STRIPE';
  return method === 'COD' || method === 'PAY_AT_STORE' ? 'COD' : 'BANK_TRANSFER';
}
