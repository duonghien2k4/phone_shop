import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ClerkAuthGuard],
})
export class ProductsModule {}
