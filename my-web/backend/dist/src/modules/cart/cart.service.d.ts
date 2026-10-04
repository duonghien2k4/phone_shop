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
export declare class CartService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCart(userId: number): Promise<CartItemResponse[]>;
    addItem(userId: number, dto: AddCartItemDto): Promise<CartItemResponse[]>;
    updateQuantity(userId: number, variantId: number, dto: UpdateCartQuantityDto): Promise<CartItemResponse[]>;
    removeItem(userId: number, variantId: number): Promise<CartItemResponse[]>;
    clearCart(userId: number): Promise<CartItemResponse[]>;
}
