import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CancelApplicationDto,
  CreateInstallmentApplicationDto,
  QueryInstallmentDto,
  RecordDecisionDto,
  RequestInfoDto,
  ResubmitInstallmentDto,
} from './dto/installment-application.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InstallmentService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'installment');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // ----------------------------------------------------
  // PUBLIC / CONFIG DATA
  // ----------------------------------------------------
  async getPartners() {
    return this.prisma.financePartner.findMany({
      orderBy: [{ recommended: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getShowrooms() {
    return this.prisma.showroomStore.findMany({
      orderBy: [{ isFlagship: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getDevices() {
    return this.prisma.product.findMany({
      where: { installment: true, isActive: true },
      include: {
        brand: true,
        category: true,
        variants: true,
        images: true,
      },
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
      take: 20,
    });
  }

  // ----------------------------------------------------
  // FILE UPLOAD (Direct Multer & Base64 Canvas/Signature)
  // ----------------------------------------------------
  async saveBase64File(base64Data: string, prefix = 'doc'): Promise<string> {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = '.png';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('pdf')) ext = '.pdf';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const filename = `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/installment/${filename}`;
  }

  async handleMulterUpload(file: { originalname: string; buffer: Buffer; mimetype?: string }): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Không tìm thấy tệp tải lên');
    }
    const ext = path.extname(file.originalname) || '.png';
    const filename = `upload-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);
    return { url: `/uploads/installment/${filename}` };
  }

  // ----------------------------------------------------
  // CUSTOMER APPLICATION ACTIONS
  // ----------------------------------------------------
  async createApplication(dto: CreateInstallmentApplicationDto, userId?: number) {
    const partner = await this.prisma.financePartner.findUnique({
      where: { id: dto.financePartnerId },
    });
    if (!partner) {
      throw new NotFoundException(`Đối tác tài chính không hợp lệ: ${dto.financePartnerId}`);
    }

    // Process base64 uploads if passed directly as base64 string
    let frontUrl = dto.idCardFrontUrl;
    let backUrl = dto.idCardBackUrl;
    let sigUrl = dto.signatureUrl;

    if (frontUrl && frontUrl.startsWith('data:')) {
      frontUrl = await this.saveBase64File(frontUrl, 'cccd-front');
    }
    if (backUrl && backUrl.startsWith('data:')) {
      backUrl = await this.saveBase64File(backUrl, 'cccd-back');
    }
    if (sigUrl && sigUrl.startsWith('data:')) {
      sigUrl = await this.saveBase64File(sigUrl, 'signature');
    }

    const applicationCode = `INS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    return this.prisma.$transaction(async (tx) => {
      const app = await tx.installmentApplication.create({
        data: {
          applicationCode,
          userId: userId || null,
          financePartnerId: dto.financePartnerId,
          orderId: dto.orderId || null,
          productId: dto.productId || null,
          productVariantId: dto.productVariantId || null,
          productName: dto.productName,
          productPrice: dto.productPrice,
          prepaidPercent: dto.prepaidPercent,
          downPayment: dto.downPayment,
          financedAmount: dto.financedAmount,
          termMonths: dto.termMonths,
          monthlyPayment: dto.monthlyPayment,
          status: 'SUBMITTED',
          isSimulated: true,

          fullName: dto.fullName,
          citizenId: dto.citizenId,
          dateOfBirth: dto.dateOfBirth,
          gender: dto.gender,
          phoneNumber: dto.phoneNumber,
          email: dto.email,
          permanentAddress: dto.permanentAddress,
          currentAddress: dto.currentAddress,
          jobTitle: dto.jobTitle,
          monthlyIncome: dto.monthlyIncome,
          companyName: dto.companyName,
          refRelation: dto.refRelation,
          refName: dto.refName,
          refPhone: dto.refPhone,
          deliveryMethod: dto.deliveryMethod || 'shop',
          pickupStoreId: dto.pickupStoreId,
          idCardFrontUrl: frontUrl,
          idCardBackUrl: backUrl,
          signatureUrl: sigUrl,
        },
        include: {
          financePartner: true,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          fromStatus: null,
          toStatus: 'SUBMITTED',
          action: 'CUSTOMER_SUBMIT',
          reason: 'Khách hàng hoàn tất và gửi hồ sơ đăng ký trả góp',
          actorId: userId || null,
          actorType: 'CUSTOMER',
        },
      });

      return app;
    });
  }

  async getMyApplications(userId: number) {
    return this.prisma.installmentApplication.findMany({
      where: { userId },
      include: {
        financePartner: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async trackApplication(codeOrId: string) {
    const isId = /^\d+$/.test(codeOrId);
    const app = await this.prisma.installmentApplication.findFirst({
      where: isId ? { id: parseInt(codeOrId, 10) } : { applicationCode: codeOrId },
      include: {
        financePartner: true,
        order: true,
        reviewer: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!app) {
      throw new NotFoundException(`Không tìm thấy hồ sơ trả góp: ${codeOrId}`);
    }
    return app;
  }

  async resubmitApplication(id: number, dto: ResubmitInstallmentDto, userId?: number) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.installmentApplication.findUnique({
        where: { id },
      });
      if (!app) {
        throw new NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
      }

      if (app.status !== 'NEED_MORE_INFO') {
        throw new ConflictException(
          `Hồ sơ đang ở trạng thái "${app.status}", chỉ có thể bổ sung thông tin khi hồ sơ ở trạng thái "NEED_MORE_INFO" (Cần bổ sung).`,
        );
      }

      let frontUrl = dto.idCardFrontUrl;
      let backUrl = dto.idCardBackUrl;
      let sigUrl = dto.signatureUrl;

      if (frontUrl && frontUrl.startsWith('data:')) {
        frontUrl = await this.saveBase64File(frontUrl, 'cccd-front');
      }
      if (backUrl && backUrl.startsWith('data:')) {
        backUrl = await this.saveBase64File(backUrl, 'cccd-back');
      }
      if (sigUrl && sigUrl.startsWith('data:')) {
        sigUrl = await this.saveBase64File(sigUrl, 'signature');
      }

      const updateData: any = {
        status: 'UNDER_REVIEW',
        customerResponseNotes: dto.notes,
        reviewedAt: new Date(),
      };

      if (frontUrl) updateData.idCardFrontUrl = frontUrl;
      if (backUrl) updateData.idCardBackUrl = backUrl;
      if (sigUrl) updateData.signatureUrl = sigUrl;
      if (dto.permanentAddress) updateData.permanentAddress = dto.permanentAddress;
      if (dto.currentAddress) updateData.currentAddress = dto.currentAddress;
      if (dto.monthlyIncome) updateData.monthlyIncome = dto.monthlyIncome;
      if (dto.companyName) updateData.companyName = dto.companyName;
      if (dto.refPhone) updateData.refPhone = dto.refPhone;

      const updated = await tx.installmentApplication.update({
        where: { id },
        data: updateData,
        include: { financePartner: true },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: 'NEED_MORE_INFO',
          toStatus: 'UNDER_REVIEW',
          action: 'CUSTOMER_RESUBMIT',
          reason: dto.notes || 'Khách hàng đã cập nhật thông tin bổ sung',
          actorId: userId || null,
          actorType: 'CUSTOMER',
        },
      });

      return updated;
    });
  }

  async cancelApplication(
    id: number,
    dto: CancelApplicationDto,
    userId?: number,
    actorType: 'CUSTOMER' | 'STAFF' = 'CUSTOMER',
  ) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.installmentApplication.findUnique({
        where: { id },
      });
      if (!app) {
        throw new NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
      }

      const terminalStatuses = ['APPROVED', 'REJECTED', 'CANCELLED'];
      if (terminalStatuses.includes(app.status)) {
        throw new ConflictException(
          `Không thể hủy hồ sơ đã ở trạng thái kết thúc: "${app.status}".`,
        );
      }

      const updated = await tx.installmentApplication.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { financePartner: true },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: app.status,
          toStatus: 'CANCELLED',
          action: actorType === 'CUSTOMER' ? 'CUSTOMER_CANCEL' : 'STAFF_CANCEL',
          reason: dto.reason || (actorType === 'CUSTOMER' ? 'Khách hàng yêu cầu hủy hồ sơ' : 'Nhân viên hủy hồ sơ theo yêu cầu'),
          actorId: userId || null,
          actorType,
        },
      });

      return updated;
    });
  }

  // ----------------------------------------------------
  // ADMIN APPRAISAL WORKFLOW
  // ----------------------------------------------------
  async getAdminApplications(query: QueryInstallmentDto) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, parseInt(query.limit || '10', 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.partnerId && query.partnerId !== 'ALL') {
      where.financePartnerId = query.partnerId;
    }

    if (query.search && query.search.trim()) {
      const search = query.search.trim();
      where.OR = [
        { applicationCode: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { citizenId: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total, countsRaw] = await Promise.all([
      this.prisma.installmentApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          financePartner: true,
          reviewer: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.installmentApplication.count({ where }),
      this.prisma.installmentApplication.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {
      ALL: 0,
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      NEED_MORE_INFO: 0,
      PARTNER_REVIEW: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };

    let totalAll = 0;
    countsRaw.forEach((row) => {
      statusCounts[row.status] = row._count.status;
      totalAll += row._count.status;
    });
    statusCounts.ALL = totalAll;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      statusCounts,
    };
  }

  async getAdminApplicationById(id: number) {
    const app = await this.prisma.installmentApplication.findUnique({
      where: { id },
      include: {
        financePartner: true,
        order: {
          include: {
            items: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!app) {
      throw new NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
    }
    return app;
  }

  async claimApplication(id: number, staffId?: number) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.installmentApplication.findUnique({ where: { id } });
      if (!app) {
        throw new NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
      }

      if (app.status !== 'SUBMITTED') {
        throw new ConflictException(
          `Chỉ có thể tiếp nhận hồ sơ đang ở trạng thái "SUBMITTED" (Đã gửi hồ sơ). Trạng thái hiện tại: "${app.status}".`,
        );
      }

      const updated = await tx.installmentApplication.update({
        where: { id },
        data: {
          status: 'UNDER_REVIEW',
          reviewerId: staffId || app.reviewerId || null,
          reviewedAt: new Date(),
        },
        include: {
          financePartner: true,
          reviewer: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_REVIEW',
          action: 'STAFF_CLAIM',
          reason: 'Nhân viên thẩm định đã tiếp nhận và đang kiểm tra tính hợp lệ của hồ sơ',
          actorId: staffId || null,
          actorType: 'STAFF',
        },
      });

      return updated;
    });
  }

  async requestInfo(id: number, dto: RequestInfoDto, staffId?: number) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.installmentApplication.findUnique({ where: { id } });
      if (!app) {
        throw new NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
      }

      if (app.status !== 'UNDER_REVIEW' && app.status !== 'PARTNER_REVIEW') {
        throw new ConflictException(
          `Chỉ có thể yêu cầu bổ sung thông tin khi hồ sơ đang kiểm tra (UNDER_REVIEW) hoặc chờ đối tác (PARTNER_REVIEW). Trạng thái hiện tại: "${app.status}".`,
        );
      }

      const checklistStr = dto.checklist && dto.checklist.length > 0 ? `\n- Hạng mục cần bổ sung: ${dto.checklist.join(', ')}` : '';
      const fullNotes = `${dto.reason}${checklistStr}${dto.notes ? `\n- Ghi chú: ${dto.notes}` : ''}`;

      const updated = await tx.installmentApplication.update({
        where: { id },
        data: {
          status: 'NEED_MORE_INFO',
          additionalInfoNotes: fullNotes,
          reviewedAt: new Date(),
          reviewerId: staffId || app.reviewerId || null,
        },
        include: {
          financePartner: true,
          reviewer: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: app.status,
          toStatus: 'NEED_MORE_INFO',
          action: 'STAFF_REQUEST_INFO',
          reason: dto.reason,
          metadata: {
            checklist: dto.checklist,
            notes: dto.notes,
          },
          actorId: staffId || null,
          actorType: 'STAFF',
        },
      });

      return updated;
    });
  }

  async submitToPartner(id: number, staffId?: number) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.installmentApplication.findUnique({
        where: { id },
        include: { financePartner: true },
      });
      if (!app) {
        throw new NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
      }

      if (app.status !== 'UNDER_REVIEW') {
        throw new ConflictException(
          `Hồ sơ phải ở trạng thái "UNDER_REVIEW" (Đang kiểm tra) trước khi chuyển đối tác. Trạng thái hiện tại: "${app.status}".`,
        );
      }

      const updated = await tx.installmentApplication.update({
        where: { id },
        data: {
          status: 'PARTNER_REVIEW',
          reviewedAt: new Date(),
          reviewerId: staffId || app.reviewerId || null,
        },
        include: {
          financePartner: true,
          reviewer: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: 'UNDER_REVIEW',
          toStatus: 'PARTNER_REVIEW',
          action: 'SUBMIT_TO_PARTNER',
          reason: `Đã thẩm định hồ sơ nội bộ hợp lệ, chuyển hồ sơ sang đối tác ${app.financePartner?.name || ''} để xét duyệt tín dụng.`,
          actorId: staffId || null,
          actorType: 'STAFF',
        },
      });

      return updated;
    });
  }

  async recordDecision(id: number, dto: RecordDecisionDto, staffId?: number) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.installmentApplication.findUnique({
        where: { id },
        include: { financePartner: true },
      });
      if (!app) {
        throw new NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
      }

      if (dto.decision === 'APPROVED') {
        if (app.status !== 'PARTNER_REVIEW') {
          throw new ConflictException(
            `Chỉ có thể ghi nhận DUYỆT (APPROVED) khi hồ sơ đang ở trạng thái Chờ kết quả đối tác (PARTNER_REVIEW). Trạng thái hiện tại: "${app.status}".`,
          );
        }
      } else if (dto.decision === 'REJECTED') {
        if (dto.decisionSource === 'INTERNAL' && app.status !== 'UNDER_REVIEW') {
          throw new ConflictException(
            `Từ chối nội bộ chỉ được thực hiện khi hồ sơ đang kiểm tra (UNDER_REVIEW). Trạng thái hiện tại: "${app.status}".`,
          );
        }
        if (dto.decisionSource === 'PARTNER' && app.status !== 'PARTNER_REVIEW') {
          throw new ConflictException(
            `Ghi nhận từ chối từ đối tác chỉ được thực hiện khi hồ sơ đang chờ đối tác (PARTNER_REVIEW). Trạng thái hiện tại: "${app.status}".`,
          );
        }
      }

      const refCode = dto.referenceCode || `${dto.decisionSource === 'PARTNER' ? 'PART' : 'INT'}-${Date.now().toString().slice(-6)}`;

      const updated = await tx.installmentApplication.update({
        where: { id },
        data: {
          status: dto.decision,
          decisionSource: dto.decisionSource,
          decisionReason: dto.reason,
          referenceCode: refCode,
          decidedAt: new Date(),
          reviewerId: staffId || app.reviewerId || null,
        },
        include: {
          financePartner: true,
          reviewer: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: app.status,
          toStatus: dto.decision,
          action: dto.decision === 'APPROVED' ? 'RECORD_APPROVAL' : 'RECORD_REJECTION',
          reason: dto.reason,
          metadata: {
            decisionSource: dto.decisionSource,
            referenceCode: refCode,
            simulated: true,
          },
          actorId: staffId || null,
          actorType: 'STAFF',
        },
      });

      return updated;
    });
  }

  async linkOrder(id: number, orderId: number, staffId?: number) {
    return this.prisma.$transaction(async (tx) => {
      const app = await tx.installmentApplication.findUnique({ where: { id } });
      if (!app) {
        throw new NotFoundException(`Không tìm thấy hồ sơ ID ${id}`);
      }

      if (app.status !== 'APPROVED') {
        throw new ConflictException(
          `Chỉ có thể liên kết đơn hàng khi hồ sơ trả góp đã được duyệt (APPROVED). Trạng thái hiện tại: "${app.status}".`,
        );
      }

      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng ID ${orderId}`);
      }

      const updated = await tx.installmentApplication.update({
        where: { id },
        data: { orderId },
        include: {
          order: true,
          financePartner: true,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: app.status,
          toStatus: app.status,
          action: 'LINK_ORDER',
          reason: `Đã liên kết hồ sơ trả góp với đơn hàng #${orderId}`,
          metadata: { orderId },
          actorId: staffId || null,
          actorType: 'STAFF',
        },
      });

      return updated;
    });
  }
}
