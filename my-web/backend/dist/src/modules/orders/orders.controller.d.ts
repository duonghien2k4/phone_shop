import type { UserPayload } from '../../common/decorators/get-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findMyOrders(user: UserPayload): Promise<({
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
    findById(user: UserPayload, orderId: number): Promise<{
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
    createOrder(user: UserPayload, dto: CreateOrderDto): Promise<{
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
