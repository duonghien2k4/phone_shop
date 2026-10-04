import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  const jwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  } as unknown as JwtService;

  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        'jwt.accessSecret': 'access-secret',
        'jwt.refreshSecret': 'refresh-secret',
        'jwt.accessExpiresIn': '15m',
        'jwt.refreshExpiresIn': '7d',
      };

      return values[key] ?? '';
    }),
  } as unknown as ConfigService;

  const service = new AuthService(prisma, jwtService, configService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register should create user with lowercased email and hashed password', async () => {
    const hashMock = bcrypt.hash as jest.Mock;
    const createMock = prisma.user.create as jest.Mock;
    const findUniqueMock = prisma.user.findUnique as jest.Mock;

    hashMock.mockResolvedValue('hashed-password');
    createMock.mockResolvedValue({
      id: 1,
      email: 'demo@gmail.com',
      role: 'CUSTOMER',
      passwordHash: 'hashed-password',
      profile: { fullName: 'Demo User', avatarUrl: null },
    });
    findUniqueMock.mockResolvedValue(null);

    const result = await service.register({
      email: ' DEMO@gmail.com ',
      password: 'secret123',
      fullName: ' Demo User ',
      phone: '0901234567',
    });

    expect(hashMock).toHaveBeenCalledWith('secret123', 10);
    expect(createMock).toHaveBeenCalled();
    expect(result.email).toBe('demo@gmail.com');
    expect(result.role).toBe('CUSTOMER');
    expect(result.fullName).toBe('Demo User');
  });

  it('login should reject invalid password', async () => {
    const findUniqueMock = prisma.user.findUnique as jest.Mock;
    const compareMock = bcrypt.compare as jest.Mock;

    compareMock.mockResolvedValue(false);
    findUniqueMock.mockResolvedValue({
      id: 1,
      email: 'demo@gmail.com',
      passwordHash: 'hashed-password',
      status: 'ACTIVE',
      role: 'CUSTOMER',
      profile: { fullName: 'Demo User', avatarUrl: null },
    });

    await expect(
      service.login({ email: 'demo@gmail.com', password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should return access and refresh tokens when credentials are valid', async () => {
    const findUniqueMock = prisma.user.findUnique as jest.Mock;
    const compareMock = bcrypt.compare as jest.Mock;
    const signSpy = jest.spyOn(jwtService, 'sign' as never).mockReturnValue('token-value' as never);
    const updateMock = prisma.user.update as jest.Mock;

    compareMock.mockResolvedValue(true);
    findUniqueMock.mockResolvedValue({
      id: 1,
      email: 'demo@gmail.com',
      passwordHash: 'hashed-password',
      status: 'ACTIVE',
      role: 'CUSTOMER',
      profile: { fullName: 'Demo User', avatarUrl: null },
      refreshToken: null,
    });
    updateMock.mockResolvedValue({});

    const result = await service.login({ email: 'demo@gmail.com', password: 'secret123' });

    expect(signSpy).toHaveBeenCalledTimes(2);
    expect(result.accessToken).toBe('token-value');
    expect(result.refreshToken).toBe('token-value');
    expect(result.user.email).toBe('demo@gmail.com');
  });
});
