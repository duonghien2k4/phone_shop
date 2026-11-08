import { api } from '@/lib/api-client';
import type { ProductApiItem } from '@/services/product.service';

export interface WishlistItemResponse {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: ProductApiItem;
}

export interface WishlistData {
  items: WishlistItemResponse[];
  products: ProductApiItem[];
  productIds: number[];
  total: number;
}

export interface ToggleWishlistResponse {
  inWishlist: boolean;
  productId: number;
  message: string;
}

export const wishlistService = {
  getWishlist: async (): Promise<WishlistData> => {
    return api.get<WishlistData>('/wishlist');
  },

  toggleWishlist: async (productId: number): Promise<ToggleWishlistResponse> => {
    return api.post<ToggleWishlistResponse>(`/wishlist/toggle/${productId}`);
  },

  addToWishlist: async (productId: number): Promise<ToggleWishlistResponse> => {
    return api.post<ToggleWishlistResponse>(`/wishlist/${productId}`);
  },

  removeFromWishlist: async (productId: number): Promise<ToggleWishlistResponse> => {
    return api.delete<ToggleWishlistResponse>(`/wishlist/${productId}`);
  },
};
