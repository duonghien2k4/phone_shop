import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import type { UserPayload } from '../../common/decorators/get-user.decorator';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { VouchersService } from './vouchers.service';

@Controller('vouchers')
@UseGuards(ClerkAuthGuard)
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Get('available')
  getAvailableVouchers(@GetUser() user: UserPayload) {
    return this.vouchersService.getAvailableVouchers(user.sub);
  }
}
