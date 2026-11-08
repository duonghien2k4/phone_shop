import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
export declare class AdminRolePolicyService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
}
