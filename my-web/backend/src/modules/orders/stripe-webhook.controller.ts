import { Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';

@Controller('payments/stripe')
export class StripeWebhookController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('webhook')
  @HttpCode(200)
  handleWebhook(
    @Headers('stripe-signature') signature: string | undefined,
    @Req() request: Request & { rawBody?: Buffer },
  ) {
    return this.ordersService.handleStripeWebhook(signature, request.rawBody);
  }
}
