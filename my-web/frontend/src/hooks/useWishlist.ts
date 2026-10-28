'use client';

import { useEffect, useCallback } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/store/useWishlistStore';
import { wishlistService } from '@/services/wishlist.service';
import { toast } from '@/store/useToastStore';

export function useWishlist() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const {
    productIds,
    items,
    isLoading,
    setWishlist,
    toggleLocal,
    isWishlisted,
    clear,
    fetchWishlist,
  } = useWishlistStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      clear();
      return;
    }

    void fetchWishlist();
  }, [isLoaded, isSignedIn, clear, fetchWishlist]);

  const toggle = useCallback(
    async (productId: number, productName?: string) => {
      if (!isLoaded) return false;

      if (!isSignedIn) {
        toast.info('Vui lòng đăng nhập để lưu sản phẩm vào danh sách yêu thích');
        if (openSignIn) {
          openSignIn();
        } else {
          router.push('/sign-in');
        }
        return false;
      }

      // Optimistic update
      const willBeInWishlist = toggleLocal(productId);
      const displayName = productName || 'sản phẩm';

      if (willBeInWishlist) {
        toast.success(`Đã thêm ${displayName} vào yêu thích`);
      } else {
        toast.info(`Đã bỏ ${displayName} khỏi yêu thích`);
      }

      try {
        const res = await wishlistService.toggleWishlist(productId);
        // Refresh wishlist in sync
        const fresh = await wishlistService.getWishlist();
        setWishlist(fresh.productIds || [], fresh.items || []);
        return res.inWishlist;
      } catch (error: any) {
        // Rollback optimistic update on error
        toggleLocal(productId);
        const msg = error?.message || 'Không thể cập nhật danh sách yêu thích';
        toast.error(msg);
        return !willBeInWishlist;
      }
    },
    [isLoaded, isSignedIn, openSignIn, router, toggleLocal, setWishlist],
  );

  return {
    productIds,
    items,
    isLoading,
    isWishlisted: (productId: number) => isWishlisted(productId),
    toggleWishlist: toggle,
  };
}
