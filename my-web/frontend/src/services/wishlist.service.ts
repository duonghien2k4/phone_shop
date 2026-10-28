import { api } from '@/lib/api-client';

export interface WishlistItemResponse {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: any;
}

export interface WishlistData {
  items: WishlistItemResponse[];
  products: any[];
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

