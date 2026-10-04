/**
 * CartService
 * Encapsulates all cart-related API endpoints.
 *
 * Related: src/hooks/useCart.ts, src/lib/api-client.ts
 * Pattern: Service Layer
 */

import { api } from '@/lib/api-client';
import type { CartItem } from '@/store/useCartStore';

export interface CartItemDto {
  variantId: number;
  quantity: number;
}

interface CartApiItem {
  variantId: number;
  productId: number;
  productName: string;
  color: string;
  storage: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
}

export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    const items = await api.get<CartApiItem[]>('/cart');

    return (items ?? []).map((item) => ({
      variantId: item.variantId,
      productId: item.productId,
      productName: item.productName,
      color: item.color,
      storage: item.storage,
      imageUrl: item.imageUrl,
      price: Number(item.price ?? 0),
      quantity: Number(item.quantity ?? 1),
    }));
  },

  addItem: async (dto: CartItemDto) => {
    return api.post<unknown>('/cart/items', dto);
  },

  updateQuantity: async (variantId: number, quantity: number) => {
    return api.put<unknown>(`/cart/items/${variantId}`, { quantity });
  },

  removeItem: async (variantId: number) => {
    return api.delete<unknown>(`/cart/items/${variantId}`);
  },

  clearCart: async () => {
    return api.delete<unknown>('/cart');
  },
};
