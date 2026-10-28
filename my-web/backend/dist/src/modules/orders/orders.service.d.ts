import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
export interface OrderItemPayload {
    productId: number;
    variantId: number;
    productName: string;
    color: string;
    storage: string;
    imageUrl?: string | null;
    quantity: number;
    unitPrice: number;
}
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMyOrders(userId: number): Promise<({
        items: {
            id: number;
            createdAt: Date;
            productId: number;
            color: string;
            storage: string;
            imageUrl: string | null;
            total: import("@prisma/client-runtime-utils").Decimal;
            productName: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            variantId: number;
            orderId: number;
        }[];
        payment: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client-runtime-utils").Decimal;
            transactionId: string | null;
            gatewayData: import("@prisma/client/runtime/client").JsonValue | null;
            paidAt: Date | null;
            orderId: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        discount: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        voucherCode: string | null;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        note: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        userId: number;
    })[]>;
    findById(userId: number, orderId: number): Promise<{
        items: {
            id: number;
            createdAt: Date;
            productId: number;
            color: string;
            storage: string;
            imageUrl: string | null;
            total: import("@prisma/client-runtime-utils").Decimal;
            productName: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            variantId: number;
            orderId: number;
        }[];
        payment: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client-runtime-utils").Decimal;
            transactionId: string | null;
            gatewayData: import("@prisma/client/runtime/client").JsonValue | null;
            paidAt: Date | null;
            orderId: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        discount: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        voucherCode: string | null;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        note: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        userId: number;
    }>;
    createOrder(userId: number, dto: CreateOrderDto): Promise<{
        items: {
            id: number;
            createdAt: Date;
            productId: number;
            color: string;
            storage: string;
            imageUrl: string | null;
            total: import("@prisma/client-runtime-utils").Decimal;
            productName: string;
            quantity: number;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            variantId: number;
            orderId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        discount: import("@prisma/client-runtime-utils").Decimal;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        voucherCode: string | null;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        note: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        userId: number;
    }>;
}
