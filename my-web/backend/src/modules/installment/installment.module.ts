import { Module } from '@nestjs/common';
import { InstallmentAdminController } from './installment-admin.controller';
import { InstallmentController } from './installment.controller';
import { InstallmentService } from './installment.service';

@Module({
  controllers: [InstallmentController, InstallmentAdminController],
  providers: [InstallmentService],
  exports: [InstallmentService],
})
export class InstallmentModule {}
