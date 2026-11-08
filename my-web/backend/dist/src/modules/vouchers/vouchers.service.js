"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VouchersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let VouchersService = class VouchersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAvailableVouchers(userId) {
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
            .filter((voucher) => voucher.usageLimit === null || voucher.usedCount < voucher.usageLimit)
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
};
exports.VouchersService = VouchersService;
exports.VouchersService = VouchersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VouchersService);
//# sourceMappingURL=vouchers.service.js.map