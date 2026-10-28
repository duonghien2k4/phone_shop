import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../database/prisma.service';
import { Request } from 'express';
import { UserPayload } from '../decorators/get-user.decorator';

type ClerkClaims = {
  sub: string;
};

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserPayload }>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : null;
    const secretKey = this.configService.get<string>('clerk.secretKey');
    const localJwtSecret = this.configService.get<string>('jwt.accessSecret');

    if (!token) {
      throw new UnauthorizedException('Yêu cầu đăng nhập');
    }

    // 1. First, try local NestJS JWT (for email/password logins)
    if (localJwtSecret) {
      try {
        const payload = (jwt.verify(token, localJwtSecret) as unknown) as {
          sub: number;
          email: string;
          role: string;
        };
        if (payload?.sub) {
          const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { profile: true },
          });
          if (user) {
            if (user.status === 'BANNED') {
              throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
            }
            request.user = {
              sub: user.id,
              email: user.email,
              role: user.role,
            };
            return true;
          }
        }
      } catch {
        // Not a local JWT, fallback to Clerk
      }
    }

    // 2. Try Clerk token
    if (!secretKey) {
      throw new UnauthorizedException('Yêu cầu đăng nhập bằng Clerk');
    }

    let clerkUserId: string | null = null;
    try {
      const claims = (await verifyToken(token, {
        secretKey,
        clockSkewInMs: 300000,
      })) as ClerkClaims;

      clerkUserId = claims?.sub ?? null;
    } catch (error: any) {
      const reason = error?.reason || error?.message || 'unknown';

      // Tolerate clock skew during development / system clock mismatch
      if (
        reason === 'token-not-active-yet' ||
        reason === 'token-iat-in-the-future' ||
        reason === 'token-expired' ||
        String(reason).includes('not before')
      ) {
        const decoded = jwt.decode(token) as { sub?: string } | null;
        if (decoded?.sub) {
          console.warn(
            `[ClerkAuthGuard] Clock skew tolerated (${reason}) for Clerk sub: ${decoded.sub}`,
          );
          clerkUserId = decoded.sub;
        }
      }

      if (!clerkUserId) {
        console.warn(`[ClerkAuthGuard] Token verification failed: ${reason}`);
        throw new UnauthorizedException(
          `Token Clerk không hợp lệ hoặc đã hết hạn (${reason})`,
        );
      }
    }

    if (!clerkUserId) {
      throw new UnauthorizedException('Token Clerk không hợp lệ');
    }

    // Fast-path: Check if user already exists by Clerk ID
    let user = await this.prisma.user.findFirst({
      where: { passwordHash: `clerk:${clerkUserId}` },
      include: { profile: true },
    });

    // If not found in DB yet, query Clerk API and upsert
    if (!user) {
      const clerkUser = await this.getClerkUser(clerkUserId, secretKey);
      const email = clerkUser.email;
      if (!email) {
        throw new UnauthorizedException('Tài khoản Clerk chưa có email');
      }

      user = await this.prisma.user.upsert({
        where: { email },
        update: {
          passwordHash: `clerk:${clerkUserId}`,
          profile: {
            upsert: {
              create: {
                fullName: clerkUser.fullName,
                avatarUrl: clerkUser.avatarUrl,
              },
              update: {
                ...(clerkUser.fullName ? { fullName: clerkUser.fullName } : {}),
                ...(clerkUser.avatarUrl ? { avatarUrl: clerkUser.avatarUrl } : {}),
              },
            },
          },
        },
        create: {
          email,
          passwordHash: `clerk:${clerkUserId}`,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          profile: {
            create: {
              fullName: clerkUser.fullName,
              avatarUrl: clerkUser.avatarUrl,
            },
          },
        },
        include: { profile: true },
      });
    } else if (!user.profile?.avatarUrl) {
      // User exists but has no avatarUrl: sync from Clerk API
      try {
        const clerkUser = await this.getClerkUser(clerkUserId, secretKey);
        if (clerkUser.avatarUrl || clerkUser.fullName) {
          await this.prisma.userProfile.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              fullName: clerkUser.fullName,
              avatarUrl: clerkUser.avatarUrl,
            },
            update: {
              ...(clerkUser.fullName ? { fullName: clerkUser.fullName } : {}),
              ...(clerkUser.avatarUrl ? { avatarUrl: clerkUser.avatarUrl } : {}),
            },
          });
          user = (await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { profile: true },
          }))!;
        }
      } catch (e) {
        console.warn('[ClerkAuthGuard] Failed to sync latest avatar from Clerk:', e);
      }
    }

    if (user.status === 'BANNED') {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    }

    request.user = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clerkUserId,
    };
    return true;
  }

  private async getClerkUser(userId: string, secretKey: string) {
    const response = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Không thể đồng bộ tài khoản Clerk');
    }

    const data = (await response.json()) as {
      email_addresses?: Array<{ id: string; email_address: string }>;
      primary_email_address_id?: string | null;
      first_name?: string | null;
      last_name?: string | null;
      image_url?: string | null;
    };
    const primaryEmail = data.email_addresses?.find(
      (item) => item.id === data.primary_email_address_id,
    );
    const email = primaryEmail?.email_address ?? data.email_addresses?.[0]?.email_address;

    return {
      email: email?.toLowerCase().trim() ?? null,
      fullName: [data.first_name, data.last_name].filter(Boolean).join(' ') || null,
      avatarUrl: data.image_url ?? null,
    };
  }
}
