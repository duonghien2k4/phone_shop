"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    configService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async findMyOrders(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                items: true,
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: true,
                payment: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        }
        return order;
    }
    async createOrder(userId, dto) {
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
                throw new common_1.BadRequestException('Giỏ hàng đang trống');
            }
            const targetItems = dto.variantIds && dto.variantIds.length > 0
                ? cart.items.filter((item) => dto.variantIds.includes(item.variantId))
                : cart.items;
            if (!targetItems.length) {
                throw new common_1.BadRequestException('Không có sản phẩm nào được chọn để thanh toán');
            }
            for (const item of targetItems) {
                const updateResult = await transaction.inventory.updateMany({
                    where: {
                        variantId: item.variantId,
                        stock: { gte: item.quantity },
                    },
                    data: {
                        stock: { decrement: item.quantity },
                    },
                });
                if (updateResult.count === 0) {
                    const itemName = `${item.variant.product.name} (${item.variant.storage || ''} ${item.variant.color || ''})`.trim();
                    throw new common_1.BadRequestException(`Sản phẩm "${itemName}" đã hết hàng hoặc không đủ số lượng trong kho.`);
                }
                await transaction.inventory.updateMany({
                    where: {
                        variantId: item.variantId,
                        stock: { lte: 0 },
                    },
                    data: {
                        status: 'OUT_OF_STOCK',
                    },
                });
            }
            const subtotal = targetItems.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
            const shippingFee = dto.shippingFee ?? 0;
            let discount = 0;
            if (dto.voucherCode) {
                const voucher = await transaction.voucher.findUnique({
                    where: { code: dto.voucherCode },
                });
                const now = new Date();
                if (!voucher ||
                    !voucher.isActive ||
                    (voucher.startsAt && voucher.startsAt > now) ||
                    (voucher.expiresAt && voucher.expiresAt < now) ||
                    (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit)) {
                    throw new common_1.BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn');
                }
                if (subtotal < Number(voucher.minOrderValue)) {
                    throw new common_1.BadRequestException('Đơn hàng chưa đạt giá trị tối thiểu của mã giảm giá');
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
                    throw new common_1.BadRequestException('Bạn đã sử dụng mã giảm giá này');
                }
                if (priorUse) {
                    await transaction.userVoucher.update({
                        where: { id: priorUse.id },
                        data: { usedAt: now },
                    });
                }
                else {
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
                throw new common_1.BadRequestException('Mức giảm giá đã thay đổi. Vui lòng tải lại checkout');
            }
            const total = subtotal + shippingFee - discount;
            if (total < 0) {
                throw new common_1.BadRequestException('Giảm giá không được lớn hơn tổng đơn hàng');
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
                    shippingAddress: dto.shippingAddress,
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
                                total: (unitPrice * item.quantity).toString(),
                            };
                        }),
                    },
                },
                include: { items: true },
            });
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
                this.logger.warn(`Order confirmation email skipped: no email for order ${order.id}`);
                return order;
            }
            await this.sendOrderConfirmationEmail(user.email, user.profile?.fullName, order);
        }
        catch (error) {
            this.logger.error(`Order ${order.id} was created, but its confirmation email could not be sent`, error instanceof Error ? error.stack : undefined);
        }
        return order;
    }
    async sendOrderConfirmationEmail(email, profileName, order) {
        const serviceId = this.configService.get('emailjs.serviceId');
        const templateId = this.configService.get('emailjs.confirmTemplateId');
        const publicKey = this.configService.get('emailjs.publicKey');
        const privateKey = this.configService.get('emailjs.privateKey');
        if (!serviceId || !templateId || !publicKey || !privateKey) {
            throw new Error('EmailJS order confirmation configuration is incomplete');
        }
        const shippingAddress = typeof order.shippingAddress === 'object' &&
            order.shippingAddress !== null &&
            !Array.isArray(order.shippingAddress)
            ? order.shippingAddress
            : {};
        const getAddressValue = (key) => {
            const value = shippingAddress[key];
            return typeof value === 'string' ? value : '';
        };
        const currency = (value) => `${Number(value).toLocaleString('vi-VN')} đ`;
        const orderItems = order.items
            .map((item, index) => {
            const variant = [item.storage, item.color].filter(Boolean).join(' / ');
            return `${index + 1}. ${item.productName}${variant ? ` (${variant})` : ''} x ${item.quantity} - ${currency(item.total)}`;
        })
            .join('\n');
        const variants = [
            ...new Set(order.items
                .map((item) => [item.storage, item.color].filter(Boolean).join(' / '))
                .filter(Boolean)),
        ].join(', ');
        const paymentMethods = {
            COD: 'Thanh toán khi nhận hàng',
            BANK_TRANSFER: 'Chuyển khoản ngân hàng',
            VNPAY: 'VNPAY',
            MOMO: 'MoMo',
            INSTALLMENT: 'Trả góp',
        };
        const paymentStatuses = {
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
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
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
                    fulfillment_mode: fulfillmentMode === 'STORE_PICKUP'
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
        });
        if (!response.ok) {
            const providerMessage = (await response.text())
                .replaceAll(privateKey, '[redacted]')
                .replaceAll(publicKey, '[redacted]')
                .replace(/[\r\n\t]+/g, ' ')
                .slice(0, 500);
            throw new Error(`EmailJS rejected order confirmation (HTTP ${response.status})${providerMessage ? `: ${providerMessage}` : ''}`);
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map