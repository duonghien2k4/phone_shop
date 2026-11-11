import type { Request } from 'express';
import { OrdersService } from './orders.service';
export declare class StripeWebhookController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    handleWebhook(signature: string | undefined, request: Request & {
        rawBody?: Buffer;
    }): Promise<{
        received: boolean;
    }>;
}
