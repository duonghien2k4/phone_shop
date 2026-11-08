import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableVouchers(userId: number) {
    const now = new Date();
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        ],
        userVouchers: {
          none: {
            userId,
            usedAt: { not: null },
          },
        },
      },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrderValue: true,
        maxDiscount: true,
        expiresAt: true,
        usageLimit: true,
        usedCount: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = vouchers
      .filter(
        (voucher) =>
          voucher.usageLimit === null || voucher.usedCount < voucher.usageLimit,
      )
      .map((voucher) => ({
        id: voucher.id,
        code: voucher.code,
        description: voucher.description,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minOrderValue: voucher.minOrderValue,
        maxDiscount: voucher.maxDiscount,
        expiresAt: voucher.expiresAt,
      }));

    return { items };
  }
}
