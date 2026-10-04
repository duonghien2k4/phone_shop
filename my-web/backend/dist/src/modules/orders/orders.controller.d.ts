import type { UserPayload } from '../../common/decorators/get-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findMyOrders(user: UserPayload): Promise<({
        payment: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            orderId: number;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client-runtime-utils").Decimal;
            transactionId: string | null;
            gatewayData: import("@prisma/client/runtime/client").JsonValue | null;
            paidAt: Date | null;
        } | null;
        items: {
            id: number;
            createdAt: Date;
            productId: number;
            color: string;
            storage: string;
            imageUrl: string | null;
            variantId: number;
            quantity: number;
            productName: string;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            orderId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        discount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.OrderStatus;
        userId: number;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        voucherCode: string | null;
        note: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    findById(user: UserPayload, orderId: number): Promise<{
        payment: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            orderId: number;
            method: import("@prisma/client").$Enums.PaymentMethod;
            amount: import("@prisma/client-runtime-utils").Decimal;
            transactionId: string | null;
            gatewayData: import("@prisma/client/runtime/client").JsonValue | null;
            paidAt: Date | null;
        } | null;
        items: {
            id: number;
            createdAt: Date;
            productId: number;
            color: string;
            storage: string;
            imageUrl: string | null;
            variantId: number;
            quantity: number;
            productName: string;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            orderId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        discount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.OrderStatus;
        userId: number;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        voucherCode: string | null;
        note: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
    }>;
    createOrder(user: UserPayload, dto: CreateOrderDto): Promise<{
        items: {
            id: number;
            createdAt: Date;
            productId: number;
            color: string;
            storage: string;
            imageUrl: string | null;
            variantId: number;
            quantity: number;
            productName: string;
            unitPrice: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            orderId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        discount: import("@prisma/client-runtime-utils").Decimal;
        status: import("@prisma/client").$Enums.OrderStatus;
        userId: number;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        voucherCode: string | null;
        note: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
    }>;
}
