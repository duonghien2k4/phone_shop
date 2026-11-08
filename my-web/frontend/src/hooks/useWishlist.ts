'use client';

import { useEffect, useCallback } from 'react';
import { useAuth as useClerkAuth, useClerk } from '@clerk/nextjs';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/store/useWishlistStore';
import { wishlistService } from '@/services/wishlist.service';
import { toast } from '@/store/useToastStore';

export function useWishlist() {
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useClerkAuth();
  const { openSignIn } = useClerk();
  const { user: internalUser, isInitialized: isInternalLoaded } = useAuthStore();
  const isSignedIn = Boolean(isClerkSignedIn || internalUser);
  const isLoaded = isClerkLoaded && isInternalLoaded;
  const router = useRouter();
  const {
    productIds,
    items,
    isLoading,
    hasFetched,
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
        toast.info('Vui long dang nhap de luu san pham vao danh sach yeu thich');
        if (openSignIn) {
          openSignIn();
        } else {
          router.push('/sign-in');
        }
        return false;
      }

      // Optimistic update
      const willBeInWishlist = toggleLocal(productId);
      const displayName = productName || 'san pham';

      if (willBeInWishlist) {
        toast.success(`Da them ${displayName} vao yeu thich`);
      } else {
        toast.info(`Da bo ${displayName} khoi yeu thich`);
      }

      try {
        const res = await wishlistService.toggleWishlist(productId);
        const fresh = await wishlistService.getWishlist();
        setWishlist(fresh.productIds || [], fresh.items || []);
        return res.inWishlist;
      } catch (error: unknown) {
        toggleLocal(productId);
        const msg = error instanceof Error ? error.message : 'Khong the cap nhat danh sach yeu thich';
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
    hasFetched,
    isLoaded,
    isSignedIn,
    isWishlisted: (productId: number) => isWishlisted(productId),
    toggleWishlist: toggle,
  };
}
