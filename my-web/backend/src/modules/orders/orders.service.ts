import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import Stripe from 'stripe';

const customerOrderItemSelect = {
  id: true,
  orderId: true,
  productId: true,
  variantId: true,
  productName: true,
  color: true,
  storage: true,
  imageUrl: true,
  quantity: true,
  unitPrice: true,
  total: true,
  createdAt: true,
} satisfies Prisma.OrderItemSelect;

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
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getStripe(): Stripe {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (!secretKey) {
      throw new BadRequestException('Stripe chưa được cấu hình trên backend');
    }
    return new Stripe(secretKey);
  }

  async createStripeCheckout(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true, payment: true },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Đơn hàng đã được thanh toán');
    }

    const stripe = this.getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: order.items.map((item) => ({
        price_data: {
          currency: 'vnd',
          product_data: { name: `${item.productName} - ${item.storage} ${item.color}` },
          unit_amount: Math.round(Number(item.unitPrice)),
        },
        quantity: item.quantity,
      })),
      customer_email: (await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email,
      success_url: `${this.configService.get<string>('frontendUrl')}/orders/${order.id}?payment=success`,
      cancel_url: `${this.configService.get<string>('frontendUrl')}/checkout?payment=cancelled`,
      metadata: { orderId: String(order.id) },
    });

    await this.prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        method: 'STRIPE',
        status: 'PENDING',
        amount: order.total,
        transactionId: session.id,
        gatewayData: { checkoutSessionId: session.id },
      },
      update: {
        method: 'STRIPE',
        transactionId: session.id,
        gatewayData: { checkoutSessionId: session.id },
      },
    });
    return { checkoutUrl: session.url };
  }

  async handleStripeWebhook(signature: string | undefined, rawBody?: Buffer) {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    if (!signature || !rawBody || !webhookSecret) {
      throw new BadRequestException('Stripe webhook chưa được cấu hình đầy đủ');
    }
    const stripe = this.getStripe();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = Number(session.metadata?.orderId);
      if (Number.isInteger(orderId)) {
        await this.prisma.$transaction([
          this.prisma.payment.updateMany({
            where: { orderId },
            data: { status: 'PAID', paidAt: new Date(), gatewayData: session as unknown as object },
          }),
          this.prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'PAID' },
          }),
        ]);
      }
    }
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = Number(session.metadata?.orderId);
      if (Number.isInteger(orderId)) {
        await this.prisma.payment.updateMany({
          where: { orderId },
          data: { status: 'FAILED', gatewayData: session as unknown as object },
        });
      }
    }
    return { received: true };
  }

  async findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { select: customerOrderItemSelect },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: { select: customerOrderItemSelect },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return order;
  }

  async createOrder(userId: number, dto: CreateOrderDto) {
    const order = await this.prisma.$transaction(async (transaction) => {
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

      // Filter only selected items if variantIds are provided
      const targetItems =
        dto.variantIds && dto.variantIds.length > 0
          ? cart.items.filter((item) => dto.variantIds!.includes(item.variantId))
          : cart.items;

      if (!targetItems.length) {
        throw new BadRequestException('Không có sản phẩm nào được chọn để thanh toán');
      }

      // Reserve stock atomically so concurrent orders cannot oversell.
      for (const item of targetItems) {
        const updateResult = await transaction.$executeRaw`
          UPDATE "inventories"
          SET
            "reserved" = "reserved" + ${item.quantity},
            "status" = CASE
              WHEN "stock" - ("reserved" + ${item.quantity}) <= 0 THEN 'OUT_OF_STOCK'::"StockStatus"
              WHEN "stock" - ("reserved" + ${item.quantity}) <= 5 THEN 'LOW_STOCK'::"StockStatus"
              ELSE 'IN_STOCK'::"StockStatus"
            END,
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE "variantId" = ${item.variantId}
            AND "stock" - "reserved" >= ${item.quantity}
        `;

        if (updateResult === 0) {
          const itemName = `${item.variant.product.name} (${item.variant.storage || ''} ${item.variant.color || ''})`.trim();
          throw new BadRequestException(
            `Sản phẩm "${itemName}" đã hết hàng hoặc không đủ số lượng trong kho.`,
          );
        }
      }

      const subtotal = targetItems.reduce(
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
          inventoryAllocationStatus: 'RESERVED',
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
            create: targetItems.map((item) => {
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
                unitCostSnapshot: item.variant.purchasePrice?.toString() ?? null,
                total: (unitPrice * item.quantity).toString(),
              };
            }),
          },
        },
        include: { items: { select: customerOrderItemSelect } },
      });

      // Only delete purchased items from the cart
      const orderedVariantIds = targetItems.map((item) => item.variantId);
      await transaction.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          variantId: { in: orderedVariantIds },
        },
      });

      return order;
    });

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          profile: { select: { fullName: true } },
        },
      });

      if (!user?.email) {
        this.logger.warn(
          `Order confirmation email skipped: no email for order ${order.id}`,
        );
        return order;
      }

      await this.sendOrderConfirmationEmail(user.email, user.profile?.fullName, order);
    } catch (error) {
      this.logger.error(
        `Order ${order.id} was created, but its confirmation email could not be sent`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return order;
  }

  private async sendOrderConfirmationEmail(
    email: string,
    profileName: string | null | undefined,
    order: Prisma.OrderGetPayload<{
      include: { items: { select: typeof customerOrderItemSelect } };
    }>,
  ): Promise<void> {
    const serviceId = this.configService.get<string>('emailjs.serviceId');
    const templateId = this.configService.get<string>(
      'emailjs.confirmTemplateId',
    );
    const publicKey = this.configService.get<string>('emailjs.publicKey');
    const privateKey = this.configService.get<string>('emailjs.privateKey');

    if (!serviceId || !templateId || !publicKey || !privateKey) {
      throw new Error('EmailJS order confirmation configuration is incomplete');
    }

    const shippingAddress =
      typeof order.shippingAddress === 'object' &&
      order.shippingAddress !== null &&
      !Array.isArray(order.shippingAddress)
        ? order.shippingAddress
        : {};
    const getAddressValue = (key: string) => {
      const value = shippingAddress[key];
      return typeof value === 'string' ? value : '';
    };
    const currency = (value: Prisma.Decimal) =>
      `${Number(value).toLocaleString('vi-VN')} đ`;
    const orderItems = order.items
      .map((item, index) => {
        const variant = [item.storage, item.color].filter(Boolean).join(' / ');
        return `${index + 1}. ${item.productName}${variant ? ` (${variant})` : ''} x ${item.quantity} - ${currency(item.total)}`;
      })
      .join('\n');
    const variants = [
      ...new Set(
        order.items
          .map((item) => [item.storage, item.color].filter(Boolean).join(' / '))
          .filter(Boolean),
      ),
    ].join(', ');
    const paymentMethods: Record<string, string> = {
      COD: 'Thanh toán khi nhận hàng',
      BANK_TRANSFER: 'Chuyển khoản ngân hàng',
      VNPAY: 'VNPAY',
      MOMO: 'MoMo',
      INSTALLMENT: 'Trả góp',
    };
    const paymentStatuses: Record<string, string> = {
      PENDING: 'Chưa thanh toán',
      PAID: 'Đã thanh toán',
      FAILED: 'Thanh toán thất bại',
      REFUNDED: 'Đã hoàn tiền',
    };
    const customerName = getAddressValue('name') || profileName || 'Quý khách';
    const fulfillmentMode = getAddressValue('fulfillmentMode');
    const address = [
      getAddressValue('address'),
      getAddressValue('city'),
    ]
      .filter(Boolean)
      .join(', ');

    const response = await fetch(
      'https://api.emailjs.com/api/v1.0/email/send',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          accessToken: privateKey,
          template_params: {
            email,
            order_id: order.id,
            customer_name: customerName,
            name: customerName,
            order_date: order.createdAt.toLocaleString('vi-VN', {
              timeZone: 'Asia/Ho_Chi_Minh',
            }),
            order_items: orderItems,
            items: orderItems,
            product_name: order.items.map((item) => item.productName).join(', '),
            variant: variants,
            category: variants,
            quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: currency(order.subtotal),
            shipping_fee: currency(order.shippingFee),
            discount: currency(order.discount),
            total: currency(order.total),
            payment_method: paymentMethods[order.paymentMethod] ?? order.paymentMethod,
            payment_status: paymentStatuses[order.paymentStatus] ?? order.paymentStatus,
            phone: getAddressValue('phone'),
            address,
            shipping_address: address,
            fulfillment_mode:
              fulfillmentMode === 'STORE_PICKUP'
                ? 'Nhận tại cửa hàng'
                : fulfillmentMode === 'HOME_DELIVERY'
                  ? 'Giao hàng tận nơi'
                  : fulfillmentMode,
            store_address: getAddressValue('storeAddress'),
            appointment_time: getAddressValue('appointmentTime'),
            voucher_code: order.voucherCode ?? '',
            note: order.note ?? '',
          },
        }),
      },
    );

    if (!response.ok) {
      const providerMessage = (await response.text())
        .replaceAll(privateKey, '[redacted]')
        .replaceAll(publicKey, '[redacted]')
        .replace(/[\r\n\t]+/g, ' ')
        .slice(0, 500);
      throw new Error(
        `EmailJS rejected order confirmation (HTTP ${response.status})${
          providerMessage ? `: ${providerMessage}` : ''
        }`,
      );
    }
  }
}
