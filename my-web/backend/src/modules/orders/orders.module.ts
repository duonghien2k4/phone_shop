import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, ClerkAuthGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
