import type { UserPayload } from '../../common/decorators/get-user.decorator';
import { VouchersService } from './vouchers.service';
export declare class VouchersController {
    private readonly vouchersService;
    constructor(vouchersService: VouchersService);
    getAvailableVouchers(user: UserPayload): Promise<{
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
