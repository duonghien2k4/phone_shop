import type { UserPayload } from '../../common/decorators/get-user.decorator';
import { AddCartItemDto, UpdateCartQuantityDto } from './dto/cart-item.dto';
import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(user: UserPayload): Promise<import("./cart.service").CartItemResponse[]>;
    addItem(user: UserPayload, dto: AddCartItemDto): Promise<import("./cart.service").CartItemResponse[]>;
    updateQuantity(user: UserPayload, variantId: number, dto: UpdateCartQuantityDto): Promise<import("./cart.service").CartItemResponse[]>;
    removeItem(user: UserPayload, variantId: number): Promise<import("./cart.service").CartItemResponse[]>;
    clearCart(user: UserPayload): Promise<import("./cart.service").CartItemResponse[]>;
}
