import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from './products.service';

describe('ProductsService reviews', () => {
  const prisma = {
    product: {
      findFirst: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
    },
  } as unknown as PrismaService;

  const service = new ProductsService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows a customer to review a product after placing a pending order', async () => {
    (prisma.product.findFirst as jest.Mock).mockResolvedValue({ id: 12 });
    (prisma.order.findFirst as jest.Mock).mockResolvedValue({ id: 34 });

    await expect(service.canUserReview('phone-slug', 56)).resolves.toEqual({
      canReview: true,
      reason: null,
    });

    expect(prisma.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 56,
          status: {
            in: ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'],
          },
          items: { some: { productId: 12 } },
        }),
      }),
    );
  });

  it('does not allow reviews when the customer has no eligible order', async () => {
    (prisma.product.findFirst as jest.Mock).mockResolvedValue({ id: 12 });
    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.canUserReview('phone-slug', 56)).resolves.toMatchObject({
      canReview: false,
    });
  });
});
