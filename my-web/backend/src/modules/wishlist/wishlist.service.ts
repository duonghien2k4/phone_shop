import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const productInclude = {
  brand: true,
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { include: { inventory: true } },
};

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(userId: number) {
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

  async toggleWishlist(userId: number, productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
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

  async addToWishlist(userId: number, productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
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

  async removeFromWishlist(userId: number, productId: number) {
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
}

