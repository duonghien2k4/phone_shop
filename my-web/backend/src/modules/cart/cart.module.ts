import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@Module({
  controllers: [CartController],
  providers: [CartService, ClerkAuthGuard],
  exports: [CartService],
})
export class CartModule {}
