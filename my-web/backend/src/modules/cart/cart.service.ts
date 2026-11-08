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
  stock?: number;
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

  async addItem(userId: number, dto: AddCartItemDto): Promise<CartItemResponse[]> {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Số lượng sản phẩm phải lớn hơn 0');
    }

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: {
        product: true,
        inventory: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const availableStock = variant.inventory?.stock ?? 0;
    if (availableStock <= 0 || variant.inventory?.status === 'OUT_OF_STOCK') {
      throw new BadRequestException('Sản phẩm này hiện đã hết hàng');
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
      throw new BadRequestException(
        `Chỉ còn ${availableStock} sản phẩm trong kho (trong giỏ đã có ${currentQtyInCart})`,
      );
    }

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

    const inventory = await this.prisma.inventory.findUnique({
      where: { variantId },
    });

    if (inventory && dto.quantity > inventory.stock) {
      throw new BadRequestException(`Chỉ còn ${inventory.stock} sản phẩm trong kho`);
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
