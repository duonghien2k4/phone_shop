import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('should return empty list when user has no orders', async () => {
    const prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;

    const configService = { get: jest.fn() } as unknown as ConfigService;
    const service = new OrdersService(prisma, configService);

    await expect(service.findMyOrders(1)).resolves.toEqual([]);
  });
});
