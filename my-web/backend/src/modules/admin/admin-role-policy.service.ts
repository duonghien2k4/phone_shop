import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SOLE_ADMIN_EMAIL } from '../../common/constants/admin.constants';

@Injectable()
export class AdminRolePolicyService implements OnModuleInit {
  private readonly logger = new Logger(AdminRolePolicyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    const result = await this.prisma.user.updateMany({
      where: {
        role: 'ADMIN',
        NOT: {
          email: { equals: SOLE_ADMIN_EMAIL, mode: 'insensitive' },
        },
      },
      data: {
        role: 'CUSTOMER',
        refreshToken: null,
      },
    });

    if (result.count > 0) {
      this.logger.warn(
        `Demoted ${result.count} non-authorized admin account(s) to CUSTOMER`,
      );
    }
  }
}
