import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

export interface OrderItemPayload {
  productId: number;
  variantId: number;
  productName: string;
  color: string;
  storage: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return order;
  }

  async createOrder(userId: number, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (transaction) => {
      const cart = await transaction.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
        },
      });

      if (!cart?.items.length) {
        throw new BadRequestException('Giỏ hàng đang trống');
      }

      const subtotal = cart.items.reduce(
        (sum, item) => sum + Number(item.variant.price) * item.quantity,
        0,
      );
      const shippingFee = dto.shippingFee ?? 0;
      let discount = 0;

      if (dto.voucherCode) {
        const voucher = await transaction.voucher.findUnique({
          where: { code: dto.voucherCode },
        });
        const now = new Date();

        if (
          !voucher ||
          !voucher.isActive ||
          (voucher.startsAt && voucher.startsAt > now) ||
          (voucher.expiresAt && voucher.expiresAt < now) ||
          (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit)
        ) {
          throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn');
        }

        if (subtotal < Number(voucher.minOrderValue)) {
          throw new BadRequestException('Đơn hàng chưa đạt giá trị tối thiểu của mã giảm giá');
        }

        discount =
          voucher.discountType === 'PERCENT'
            ? Math.round((subtotal * Number(voucher.discountValue)) / 100)
            : Number(voucher.discountValue);
        if (voucher.maxDiscount !== null) {
          discount = Math.min(discount, Number(voucher.maxDiscount));
        }
        discount = Math.min(discount, subtotal);

        const priorUse = await transaction.userVoucher.findUnique({
          where: {
            userId_voucherId: { userId, voucherId: voucher.id },
          },
        });
        if (priorUse?.usedAt) {
          throw new BadRequestException('Bạn đã sử dụng mã giảm giá này');
        }

        if (priorUse) {
          await transaction.userVoucher.update({
            where: { id: priorUse.id },
            data: { usedAt: now },
          });
        } else {
          await transaction.userVoucher.create({
            data: { userId, voucherId: voucher.id, usedAt: now },
          });
        }
        await transaction.voucher.update({
          where: { id: voucher.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      if ((dto.discount ?? 0) !== discount) {
        throw new BadRequestException('Mức giảm giá đã thay đổi. Vui lòng tải lại checkout');
      }

      const total = subtotal + shippingFee - discount;

      if (total < 0) {
        throw new BadRequestException('Giảm giá không được lớn hơn tổng đơn hàng');
      }

      const order = await transaction.order.create({
        data: {
          userId,
          status: 'PENDING',
          subtotal: subtotal.toString(),
          shippingFee: shippingFee.toString(),
          discount: discount.toString(),
          total: total.toString(),
          voucherCode: dto.voucherCode,
          shippingAddress: dto.shippingAddress as any,
          note: dto.note,
          paymentMethod: dto.paymentMethod,
          paymentStatus: 'PENDING',
          items: {
            create: cart.items.map((item) => {
              const unitPrice = Number(item.variant.price);
              return {
                productId: item.variant.productId,
                variantId: item.variantId,
                productName: item.variant.product.name,
                color: item.variant.color,
                storage: item.variant.storage,
                imageUrl: item.variant.imageUrl,
                quantity: item.quantity,
                unitPrice: unitPrice.toString(),
                total: (unitPrice * item.quantity).toString(),
              };
            }),
          },
        },
        include: { items: true },
      });

      await transaction.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });
  }
}
