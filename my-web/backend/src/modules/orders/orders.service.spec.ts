import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('should return empty list when user has no orders', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      order: {
        findMany,
      },
    } as unknown as PrismaService;

    const configService = { get: jest.fn() } as unknown as ConfigService;
    const service = new OrdersService(prisma, configService);

    await expect(service.findMyOrders(1)).resolves.toEqual([]);
    expect(findMany.mock.calls[0][0].include.items.select).not.toHaveProperty(
      'unitCostSnapshot',
    );
  });

  it('reserves inventory and creates a pending order without reducing physical stock', async () => {
    const transaction = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: 8,
          items: [
            {
              variantId: 12,
              quantity: 2,
              variant: {
                productId: 5,
                name: undefined,
                product: { id: 5, name: 'Phone' },
                color: 'Black',
                storage: '128GB',
                imageUrl: null,
                price: 100,
                purchasePrice: 65,
              },
            },
          ],
        }),
      },
      $executeRaw: jest.fn().mockResolvedValue(1),
      order: {
        create: jest.fn().mockResolvedValue({ id: 33, items: [] }),
      },
      cartItem: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const prisma = {
      $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
        callback(transaction),
      ),
      user: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const service = new OrdersService(
      prisma,
      { get: jest.fn() } as unknown as ConfigService,
    );

    await service.createOrder(4, {
      variantIds: [12],
      shippingFee: 0,
      discount: 0,
      paymentMethod: 'COD',
      shippingAddress: {
        name: 'Customer',
        phone: '0900000000',
        address: 'Address',
        city: 'Hồ Chí Minh',
        fulfillmentMode: 'HOME_DELIVERY',
      },
    });

    expect(transaction.$executeRaw).toHaveBeenCalledTimes(1);
    expect(transaction.$executeRaw.mock.calls[0][0].join('')).toContain(
      '"reserved" = "reserved" + ',
    );
    expect(transaction.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING',
          inventoryAllocationStatus: 'RESERVED',
          items: {
            create: [
              expect.objectContaining({
                unitCostSnapshot: '65',
              }),
            ],
          },
        }),
      }),
    );
  });

  it('rejects an order when there is not enough unreserved stock', async () => {
    const transaction = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: 8,
          items: [
            {
              variantId: 12,
              quantity: 2,
              variant: {
                productId: 5,
                product: { id: 5, name: 'Phone' },
                color: 'Black',
                storage: '128GB',
                imageUrl: null,
                price: 100,
              },
            },
          ],
        }),
      },
      $executeRaw: jest.fn().mockResolvedValue(0),
      order: { create: jest.fn() },
      cartItem: { deleteMany: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const service = new OrdersService(
      prisma,
      { get: jest.fn() } as unknown as ConfigService,
    );

    await expect(
      service.createOrder(4, {
        variantIds: [12],
        shippingFee: 0,
        discount: 0,
        paymentMethod: 'COD',
        shippingAddress: {
          name: 'Customer',
          phone: '0900000000',
          address: 'Address',
          city: 'Hồ Chí Minh',
          fulfillmentMode: 'HOME_DELIVERY',
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction.order.create).not.toHaveBeenCalled();
  });
});
