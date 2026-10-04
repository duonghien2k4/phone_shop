import { PrismaService } from '../../database/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('should return empty list when user has no orders', async () => {
    const prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;

    const service = new OrdersService(prisma);

    await expect(service.findMyOrders(1)).resolves.toEqual([]);
  });
});
