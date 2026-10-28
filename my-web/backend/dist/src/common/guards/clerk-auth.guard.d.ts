import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
export declare class ClerkAuthGuard implements CanActivate {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getClerkUser;
}
