import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { DatabaseModule } from '../../database/database.module';
import { ConfigModule } from '@nestjs/config';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [OrdersController, StripeWebhookController],
  providers: [OrdersService, ClerkAuthGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
