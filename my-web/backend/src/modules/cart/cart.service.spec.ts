import { PrismaService } from '../../database/prisma.service';
import { CartService } from './cart.service';

describe('CartService', () => {
  it('should return empty cart when user has no cart', async () => {
    const prisma = {
      cart: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;

    const service = new CartService(prisma);

    await expect(service.getCart(1)).resolves.toEqual([]);
  });
});
