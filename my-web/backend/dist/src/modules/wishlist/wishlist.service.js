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
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const productInclude = {
    brand: true,
    category: true,
    images: { orderBy: { sortOrder: 'asc' } },
    variants: { include: { inventory: true } },
};
let WishlistService = class WishlistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWishlist(userId) {
        const items = await this.prisma.wishlistItem.findMany({
            where: { userId },
            include: {
                product: {
                    include: productInclude,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const products = items.map((item) => item.product);
        const productIds = items.map((item) => item.productId);
        return {
            items,
            products,
            productIds,
            total: items.length,
        };
    }
    async toggleWishlist(userId, productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Sản phẩm không tồn tại');
        }
        const existing = await this.prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        if (existing) {
            await this.prisma.wishlistItem.delete({
                where: { id: existing.id },
            });
            return {
                inWishlist: false,
                productId,
                message: 'Đã xóa sản phẩm khỏi danh sách yêu thích',
            };
        }
        await this.prisma.wishlistItem.create({
            data: {
                userId,
                productId,
            },
        });
        return {
            inWishlist: true,
            productId,
            message: 'Đã thêm sản phẩm vào danh sách yêu thích',
        };
    }
    async addToWishlist(userId, productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Sản phẩm không tồn tại');
        }
        const item = await this.prisma.wishlistItem.upsert({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
            update: {},
            create: {
                userId,
                productId,
            },
        });
        return {
            inWishlist: true,
            productId,
            item,
            message: 'Đã thêm sản phẩm vào danh sách yêu thích',
        };
    }
    async removeFromWishlist(userId, productId) {
        const existing = await this.prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
        if (existing) {
            await this.prisma.wishlistItem.delete({
                where: { id: existing.id },
            });
        }
        return {
            inWishlist: false,
            productId,
            message: 'Đã xóa sản phẩm khỏi danh sách yêu thích',
        };
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map