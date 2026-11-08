import { PaymentMethod, PaymentStatus } from '@prisma/client';
export declare class OrderItemDto {
    productId: number;
    variantId: number;
    productName: string;
    color: string;
    storage: string;
    imageUrl?: string | null;
    quantity: number;
    unitPrice: number;
}
export declare class CreateOrderDto {
    variantIds?: number[];
    items?: OrderItemDto[];
    shippingFee?: number;
    discount?: number;
    voucherCode?: string | null;
    note?: string;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    shippingAddress: Record<string, any>;
}
