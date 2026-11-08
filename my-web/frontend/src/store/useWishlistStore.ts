import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistService, type WishlistItemResponse } from '@/services/wishlist.service';

interface WishlistState {
  productIds: number[];
  items: WishlistItemResponse[];
  isLoading: boolean;
  hasFetched: boolean;
  isFetching: boolean;
  setWishlist: (productIds: number[], items?: WishlistItemResponse[]) => void;
  toggleLocal: (productId: number) => boolean;
  isWishlisted: (productId: number) => boolean;
  setLoading: (isLoading: boolean) => void;
  clear: () => void;
  fetchWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      items: [],
      isLoading: false,
      hasFetched: false,
      isFetching: false,

      setWishlist: (productIds, items = []) =>
        set({
          productIds,
          items,
          isLoading: false,
          hasFetched: true,
          isFetching: false,
        }),

      toggleLocal: (productId) => {
        const { productIds } = get();
        const exists = productIds.includes(productId);
        const nextIds = exists
          ? productIds.filter((id) => id !== productId)
          : [...productIds, productId];
        set({ productIds: nextIds });
        return !exists;
      },

      isWishlisted: (productId) => get().productIds.includes(productId),

      setLoading: (isLoading) => set({ isLoading }),

      clear: () =>
        set({
          productIds: [],
          items: [],
          hasFetched: false,
          isFetching: false,
          isLoading: false,
        }),

      fetchWishlist: async () => {
        const { isFetching, hasFetched } = get();
        if (isFetching || hasFetched) return;

        set({ isFetching: true, isLoading: true });
        try {
          const data = await wishlistService.getWishlist();
          if (data) {
            set({
              productIds: data.productIds || [],
              items: data.items || [],
              hasFetched: true,
              isFetching: false,
              isLoading: false,
            });
          }
        } catch (error: unknown) {
          // If 401 occurs (token invalid/expired or guest), do not keep hammering server
          const message = error instanceof Error ? error.message : String(error);
          console.warn('Wishlist sync warning:', message);
          set({ isFetching: false, isLoading: false, hasFetched: true });
        }
      },
    }),
    {
      name: 'socmobile_wishlist',
      partialize: (state) => ({ productIds: state.productIds }),
    },
  ),
);
