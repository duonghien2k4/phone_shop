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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                                inventory: true,
                            },
                        },
                    },
                },
            },
        });
        if (!cart) {
            return [];
        }
        return cart.items.map((item) => ({
            variantId: item.variant.id,
            productId: item.variant.productId,
            productName: item.variant.product.name,
            color: item.variant.color,
            storage: item.variant.storage,
            imageUrl: item.variant.imageUrl || item.variant.product.image,
            price: Number(item.variant.price),
            quantity: item.quantity,
            stock: item.variant.inventory?.stock ?? 0,
        }));
    }
    async addItem(userId, dto) {
        if (dto.quantity <= 0) {
            throw new common_1.BadRequestException('Số lượng sản phẩm phải lớn hơn 0');
        }
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: dto.variantId },
            include: {
                product: true,
                inventory: true,
            },
        });
        if (!variant) {
            throw new common_1.NotFoundException('Sản phẩm không tồn tại');
        }
        const availableStock = variant.inventory?.stock ?? 0;
        if (availableStock <= 0 || variant.inventory?.status === 'OUT_OF_STOCK') {
            throw new common_1.BadRequestException('Sản phẩm này hiện đã hết hàng');
        }
        const cart = await this.prisma.cart.upsert({
            where: { userId },
            update: {},
            create: { userId },
        });
        const item = await this.prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId: dto.variantId,
                },
            },
        });
        const currentQtyInCart = item ? item.quantity : 0;
        if (currentQtyInCart + dto.quantity > availableStock) {
            throw new common_1.BadRequestException(`Chỉ còn ${availableStock} sản phẩm trong kho (trong giỏ đã có ${currentQtyInCart})`);
        }
        if (item) {
            await this.prisma.cartItem.update({
                where: { id: item.id },
                data: { quantity: item.quantity + dto.quantity },
            });
        }
        else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId: dto.variantId,
                    quantity: dto.quantity,
                },
            });
        }
        return this.getCart(userId);
    }
    async updateQuantity(userId, variantId, dto) {
        if (dto.quantity <= 0) {
            return this.removeItem(userId, variantId);
        }
        const inventory = await this.prisma.inventory.findUnique({
            where: { variantId },
        });
        if (inventory && dto.quantity > inventory.stock) {
            throw new common_1.BadRequestException(`Chỉ còn ${inventory.stock} sản phẩm trong kho`);
        }
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            return [];
        }
        const item = await this.prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId,
                },
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Sản phẩm không có trong giỏ hàng');
        }
        await this.prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: dto.quantity },
        });
        return this.getCart(userId);
    }
    async removeItem(userId, variantId) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            return [];
        }
        await this.prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                variantId,
            },
        });
        return this.getCart(userId);
    }
    async clearCart(userId) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            return [];
        }
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return [];
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map