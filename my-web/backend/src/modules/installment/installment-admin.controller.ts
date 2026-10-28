import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  CancelApplicationDto,
  QueryInstallmentDto,
  RecordDecisionDto,
  RequestInfoDto,
} from './dto/installment-application.dto';
import { InstallmentService } from './installment.service';
import * as jwt from 'jsonwebtoken';

@Controller('admin/installment')
export class InstallmentAdminController {
  constructor(private readonly installmentService: InstallmentService) {}

  @Get('applications')
  getApplications(@Query() query: QueryInstallmentDto) {
    return this.installmentService.getAdminApplications(query);
  }

  @Get('applications/:id')
  getApplicationById(@Param('id', ParseIntPipe) id: number) {
    return this.installmentService.getAdminApplicationById(id);
  }

  @Post('applications/:id/claim')
  claimApplication(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const staffId = this.extractStaffIdFromReq(req);
    return this.installmentService.claimApplication(id, staffId);
  }

  @Post('applications/:id/request-info')
  requestInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RequestInfoDto,
    @Req() req: Request,
  ) {
    const staffId = this.extractStaffIdFromReq(req);
    return this.installmentService.requestInfo(id, dto, staffId);
  }

  @Post('applications/:id/submit-to-partner')
  submitToPartner(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const staffId = this.extractStaffIdFromReq(req);
    return this.installmentService.submitToPartner(id, staffId);
  }

  @Post('applications/:id/record-decision')
  recordDecision(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordDecisionDto,
    @Req() req: Request,
  ) {
    const staffId = this.extractStaffIdFromReq(req);
    return this.installmentService.recordDecision(id, dto, staffId);
  }

  @Post('applications/:id/link-order')
  linkOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('orderId', ParseIntPipe) orderId: number,
    @Req() req: Request,
  ) {
    const staffId = this.extractStaffIdFromReq(req);
    return this.installmentService.linkOrder(id, orderId, staffId);
  }

  @Post('applications/:id/cancel')
  cancelApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelApplicationDto,
    @Req() req: Request,
  ) {
    const staffId = this.extractStaffIdFromReq(req);
    return this.installmentService.cancelApplication(id, dto, staffId, 'STAFF');
  }

  private extractStaffIdFromReq(req: Request): number | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return undefined;
    const token = authHeader.slice(7);
    try {
      const decoded: any = jwt.decode(token);
      if (decoded && decoded.sub) {
        const parsed = parseInt(decoded.sub, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
    } catch {
      // Ignore
    }
    return undefined;
  }
}
