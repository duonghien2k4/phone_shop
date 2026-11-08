import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';

@Module({
  imports: [DatabaseModule],
  controllers: [VouchersController],
  providers: [ClerkAuthGuard, VouchersService],
})
export class VouchersModule {}
