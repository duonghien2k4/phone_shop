import { PrismaService } from '../../database/prisma.service';
export declare class VouchersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAvailableVouchers(userId: number): Promise<{
        items: {
            id: number;
            code: string;
            description: string | null;
            discountType: string;
            discountValue: import("@prisma/client-runtime-utils").Decimal;
            minOrderValue: import("@prisma/client-runtime-utils").Decimal;
            maxDiscount: import("@prisma/client-runtime-utils").Decimal | null;
            expiresAt: Date | null;
        }[];
    }>;
}
