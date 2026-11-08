import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
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
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    findMyOrders(userId: number): Promise<({
        items: {
            id: number;
            createdAt: Date;
            productId: number;
            color: string;
            storage: string;
            imageUrl: string | null;
            total: Prisma.Decimal;
            productName: string;
            quantity: number;
            unitPrice: Prisma.Decimal;
            variantId: number;
            orderId: number;
        }[];
        payment: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: Prisma.Decimal;
            transactionId: string | null;
            gatewayData: Prisma.JsonValue | null;
            paidAt: Date | null;
            orderId: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        discount: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        shippingFee: Prisma.Decimal;
        total: Prisma.Decimal;
        voucherCode: string | null;
        shippingAddress: Prisma.JsonValue;
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
            total: Prisma.Decimal;
            productName: string;
            quantity: number;
            unitPrice: Prisma.Decimal;
            variantId: number;
            orderId: number;
        }[];
        payment: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: Prisma.Decimal;
            transactionId: string | null;
            gatewayData: Prisma.JsonValue | null;
            paidAt: Date | null;
            orderId: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        discount: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        shippingFee: Prisma.Decimal;
        total: Prisma.Decimal;
        voucherCode: string | null;
        shippingAddress: Prisma.JsonValue;
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
            total: Prisma.Decimal;
            productName: string;
            quantity: number;
            unitPrice: Prisma.Decimal;
            variantId: number;
            orderId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        discount: Prisma.Decimal;
        subtotal: Prisma.Decimal;
        shippingFee: Prisma.Decimal;
        total: Prisma.Decimal;
        voucherCode: string | null;
        shippingAddress: Prisma.JsonValue;
        note: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        userId: number;
    }>;
    private sendOrderConfirmationEmail;
}
