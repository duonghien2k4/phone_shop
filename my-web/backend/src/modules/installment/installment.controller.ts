import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import {
  CancelApplicationDto,
  CreateInstallmentApplicationDto,
  RequestInstallmentOtpDto,
  ResubmitInstallmentDto,
  VerifyInstallmentOtpDto,
} from './dto/installment-application.dto';
import { InstallmentService } from './installment.service';
import * as jwt from 'jsonwebtoken';

@Controller('installment')
export class InstallmentController {
  constructor(private readonly installmentService: InstallmentService) {}

  @Get('partners')
  getPartners() {
    return this.installmentService.getPartners();
  }

  @Get('showrooms')
  getShowrooms() {
    return this.installmentService.getShowrooms();
  }

  @Get('devices')
  getDevices() {
    return this.installmentService.getDevices();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file?: { originalname: string; buffer: Buffer },
    @Body() body?: { base64?: string; prefix?: string },
  ) {
    if (file) {
      return this.installmentService.handleMulterUpload(file);
    }
    if (body?.base64) {
      const url = await this.installmentService.saveBase64File(
        body.base64,
        body.prefix || 'upload',
      );
      return { url };
    }
    throw new BadRequestException('Vui lòng tải lên tệp ảnh hoặc chuỗi dữ liệu ảnh base64');
  }

  @Post('otp/send')
  sendOtp(@Body() dto: RequestInstallmentOtpDto) {
    return this.installmentService.sendOtp(dto.email);
  }

  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyInstallmentOtpDto) {
    return this.installmentService.verifyOtp(dto);
  }

  @Post('applications')
  async createApplication(
    @Body() dto: CreateInstallmentApplicationDto,
    @Req() req: Request,
  ) {
    const userId = this.extractUserIdFromReq(req);
    return this.installmentService.createApplication(dto, userId);
  }

  @Get('applications/my')
  async getMyApplications(@Req() req: Request) {
    const userId = this.extractUserIdFromReq(req);
    if (!userId) {
      return [];
    }
    return this.installmentService.getMyApplications(userId);
  }

  @Get('applications/track/:code')
  async trackApplication(@Param('code') code: string) {
    return this.installmentService.trackApplication(code);
  }

  @Post('applications/:id/resubmit')
  async resubmitApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResubmitInstallmentDto,
    @Req() req: Request,
  ) {
    const userId = this.extractUserIdFromReq(req);
    return this.installmentService.resubmitApplication(id, dto, userId);
  }

  @Post('applications/:id/cancel')
  async cancelApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelApplicationDto,
    @Req() req: Request,
  ) {
    const userId = this.extractUserIdFromReq(req);
    return this.installmentService.cancelApplication(id, dto, userId, 'CUSTOMER');
  }

  private extractUserIdFromReq(req: Request): number | undefined {
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
      // Ignore invalid token in optional extraction
    }
    return undefined;
  }
}
