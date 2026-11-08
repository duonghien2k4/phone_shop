import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { PrismaService } from '../../database/prisma.service';
import { ClerkAuthGuard } from './clerk-auth.guard';

jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
}));

describe('ClerkAuthGuard', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  } as unknown as PrismaService;
  const config = {
    get: jest.fn((key: string) => {
      if (key === 'clerk.secretKey') return 'clerk-secret';
      return '';
    }),
  } as unknown as ConfigService;
  const guard = new ClerkAuthGuard(config, prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refreshes Clerk JWKS once when a token key id is not cached', async () => {
    const verifyTokenMock = verifyToken as jest.Mock;
    verifyTokenMock
      .mockRejectedValueOnce({ reason: 'jwk-kid-mismatch' })
      .mockResolvedValueOnce({ sub: 'clerk-user-id' });
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 21,
      email: 'customer@example.com',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      profile: { avatarUrl: 'avatar.png' },
    });

    const request = {
      headers: { authorization: 'Bearer clerk-token' },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(verifyTokenMock).toHaveBeenCalledTimes(2);
    expect(verifyTokenMock).toHaveBeenNthCalledWith(
      2,
      'clerk-token',
      expect.objectContaining({
        secretKey: 'clerk-secret',
        skipJwksCache: true,
      }),
    );
    expect(request).toHaveProperty('user.sub', 21);
  });
});
