import {
  InventoryAllocationStatus,
  OrderStatus,
  PaymentStatus,
} from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService dashboard statistics', () => {
  it('groups actual yearly orders by month and counts revenue only for paid orders', async () => {
    const year = new Date().getUTCFullYear();
    const januaryPaidOrder = {
      createdAt: new Date(Date.UTC(year, 0, 10)),
      total: 250000,
      subtotal: 250000,
      discount: 0,
      shippingFee: 0,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'COD',
      items: [{ quantity: 1, unitCostSnapshot: 150000 }],
    };
    const januaryPendingOrder = {
      createdAt: new Date(Date.UTC(year, 0, 15)),
      total: 100000,
      subtotal: 100000,
      discount: 0,
      shippingFee: 0,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: 'COD',
      items: [{ quantity: 1, unitCostSnapshot: 60000 }],
    };
    const februaryPaidOrder = {
      createdAt: new Date(Date.UTC(year, 1, 5)),
      total: 500000,
      subtotal: 500000,
      discount: 0,
      shippingFee: 0,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'VNPAY',
      items: [{ quantity: 1, unitCostSnapshot: 350000 }],
    };
    const marchPaidOrderWithoutCost = {
      createdAt: new Date(Date.UTC(year, 2, 8)),
      total: 125000,
      subtotal: 125000,
      discount: 0,
      shippingFee: 0,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'MOMO',
      items: [{ quantity: 1, unitCostSnapshot: null }],
    };
    const orderFindMany = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        januaryPaidOrder,
        januaryPendingOrder,
        februaryPaidOrder,
        marchPaidOrderWithoutCost,
      ]);
    const groupBy = jest.fn().mockResolvedValue([]);
    const prisma = {
      order: {
        count: jest.fn().mockResolvedValue(3),
        aggregate: jest.fn().mockResolvedValue({ _sum: { total: 875000 } }),
        findMany: orderFindMany,
      },
      product: { count: jest.fn().mockResolvedValue(0) },
      inventory: { count: jest.fn().mockResolvedValue(0) },
      user: { count: jest.fn().mockResolvedValue(0) },
      orderItem: { groupBy },
    } as unknown as PrismaService;
    const service = new AdminService(prisma);

    const result = await service.getDashboardStats();

    expect(result.year).toBe(year);
    expect(groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          order: {
            is: {
              paymentStatus: PaymentStatus.PAID,
              createdAt: {
                gte: new Date(Date.UTC(year, 0, 1)),
                lt: new Date(Date.UTC(year + 1, 0, 1)),
              },
            },
          },
        },
      }),
    );
    expect(result.monthlyData[0]).toEqual({
      month: 'Th 1',
      revenue: 250000,
      grossProfit: 100000,
      orders: 2,
    });
    expect(result.monthlyData[1]).toEqual({
      month: 'Th 2',
      revenue: 500000,
      grossProfit: 150000,
      orders: 1,
    });
    expect(result.monthlyData[2]).toEqual({
      month: 'Th 3',
      revenue: 125000,
      grossProfit: 0,
      orders: 1,
    });
    expect(result.monthlyData).toHaveLength(12);
    expect(orderFindMany).toHaveBeenLastCalledWith({
      where: {
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
      select: {
        createdAt: true,
        total: true,
        subtotal: true,
        discount: true,
        paymentStatus: true,
        paymentMethod: true,
        items: {
          select: {
            quantity: true,
            unitCostSnapshot: true,
            variant: {
              select: {
                purchasePrice: true,
              },
            },
          },
        },
      },
    });
    expect(result.overview.yearToDateGrossProfit).toBe(250000);
    expect(result.overview.yearToDateRevenue).toBe(875000);
    expect(result.overview.yearToDatePaidOrders).toBe(3);
    expect(result.overview.yearToDatePaidOrdersWithCost).toBe(2);
    expect(result.overview.yearToDatePaidOrdersMissingCost).toBe(1);
    expect(result.paymentMethodData).toEqual([
      { paymentMethod: 'COD', revenue: 250000, orders: 1 },
      { paymentMethod: 'VNPAY', revenue: 500000, orders: 1 },
      { paymentMethod: 'MOMO', revenue: 125000, orders: 1 },
    ]);
  });

  it('rejects a negative purchase cost when creating a variant', async () => {
    const createVariant = jest.fn();
    const prisma = {
      productVariant: { create: createVariant },
    } as unknown as PrismaService;
    const service = new AdminService(prisma);

    await expect(
      service.createVariant(12, {
        storage: '256GB',
        price: 25000000,
        purchasePrice: -1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(createVariant).not.toHaveBeenCalled();
  });

  it('stores the entered purchase cost on the default product variant', async () => {
    const createProduct = jest.fn().mockResolvedValue({});
    const prisma = {
      product: { create: createProduct },
    } as unknown as PrismaService;
    const service = new AdminService(prisma);

    await service.createProduct({
      name: 'Test phone',
      basePrice: 30000000,
      salePrice: 28000000,
      purchasePrice: 22000000,
      brandId: 1,
      categoryId: 1,
    });

    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          variants: {
            create: [
              expect.objectContaining({
                storage: '128GB',
                purchasePrice: 22000000,
              }),
            ],
          },
        }),
      }),
    );
  });

  describe('AdminService order inventory allocation', () => {
    const createService = (
      currentOrder: Record<string, unknown>,
      rawAffectedRows = 1,
    ) => {
      const transaction = {
        order: {
          findUnique: jest.fn().mockResolvedValue(currentOrder),
          update: jest.fn().mockImplementation(({ data }) =>
            Promise.resolve({ ...currentOrder, ...data, payment: null }),
          ),
        },
        $executeRaw: jest.fn().mockResolvedValue(rawAffectedRows),
        payment: { update: jest.fn() },
      };
      const prisma = {
        $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
          callback(transaction),
        ),
      } as unknown as PrismaService;
      return { service: new AdminService(prisma), transaction };
    };

    const pendingOrder = {
      id: 34,
      status: OrderStatus.PENDING,
      inventoryAllocationStatus: InventoryAllocationStatus.RESERVED,
      items: [{ variantId: 12, quantity: 2, productName: 'Phone' }],
    };

    it('commits reserved stock when an order is confirmed', async () => {
      const { service, transaction } = createService(pendingOrder);

      await service.updateOrderStatus(34, OrderStatus.CONFIRMED);

      expect(transaction.$executeRaw).toHaveBeenCalledTimes(1);
      expect(transaction.$executeRaw.mock.calls[0][0].join('')).toContain(
        '"stock" = "stock" - ',
      );
      expect(transaction.$executeRaw.mock.calls[0][0].join('')).toContain(
        '"reserved" = "reserved" - ',
      );
      expect(transaction.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: OrderStatus.CONFIRMED,
            inventoryAllocationStatus: InventoryAllocationStatus.COMMITTED,
          }),
        }),
      );
    });

    it('releases reserved stock without reducing physical stock when cancelled', async () => {
      const { service, transaction } = createService(pendingOrder);

      await service.updateOrderStatus(34, OrderStatus.CANCELLED);

      const query = transaction.$executeRaw.mock.calls[0][0].join('');
      expect(query).toContain('"reserved" = "reserved" - ');
      expect(query).not.toContain('"stock" = "stock" - ');
      expect(transaction.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            inventoryAllocationStatus: InventoryAllocationStatus.RELEASED,
          }),
        }),
      );
    });

    it('restores stock when a previously committed pending order is cancelled', async () => {
      const legacyOrder = {
        ...pendingOrder,
        inventoryAllocationStatus: InventoryAllocationStatus.COMMITTED,
      };
      const { service, transaction } = createService(legacyOrder);

      await service.updateOrderStatus(34, OrderStatus.CANCELLED);

      const query = transaction.$executeRaw.mock.calls[0][0].join('');
      expect(query).toContain('"stock" = "stock" + ');
      expect(query).not.toContain('"reserved" = "reserved" - ');
      expect(transaction.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            inventoryAllocationStatus: InventoryAllocationStatus.RELEASED,
          }),
        }),
      );
    });

    it('does not confirm an order if its reserved quantity is missing', async () => {
      const { service, transaction } = createService(pendingOrder, 0);

      await expect(
        service.updateOrderStatus(34, OrderStatus.CONFIRMED),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(transaction.order.update).not.toHaveBeenCalled();
    });
  });
});
