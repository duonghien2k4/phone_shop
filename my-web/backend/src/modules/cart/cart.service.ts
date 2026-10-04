import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AddCartItemDto, UpdateCartQuantityDto } from './dto/cart-item.dto';

export interface CartItemResponse {
  variantId: number;
  productId: number;
  productName: string;
  color: string;
  storage: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: number): Promise<CartItemResponse[]> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
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
      imageUrl: item.variant.imageUrl,
      price: Number(item.variant.price),
      quantity: item.quantity,
    }));
  }

  async addItem(userId: number, dto: AddCartItemDto): Promise<CartItemResponse[]> {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Số lượng sản phẩm phải lớn hơn 0');
    }

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: dto.variantId,
        },
      },
    });

    if (item) {
      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: item.quantity + dto.quantity },
      });
    } else {
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

  async updateQuantity(
    userId: number,
    variantId: number,
    dto: UpdateCartQuantityDto,
  ): Promise<CartItemResponse[]> {
    if (dto.quantity <= 0) {
      return this.removeItem(userId, variantId);
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
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: number, variantId: number): Promise<CartItemResponse[]> {
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

  async clearCart(userId: number): Promise<CartItemResponse[]> {
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
}
