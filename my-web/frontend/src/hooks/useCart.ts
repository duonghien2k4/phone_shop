/**
 * useCart Hook
 * Custom React hook that abstracts all shopping cart logic.
 * Encapsulates the Zustand store and coordinates API sync if the user is authenticated.
 *
 * Related: src/store/useCartStore.ts, src/services/cart.service.ts
 * Pattern: Custom Hook for state abstraction (anti-leak store rule)
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { cartService } from '@/services/cart.service';
import { toast } from '@/store/useToastStore';

const CLOCK_SKEW_ERRORS = ['token-not-active-yet', 'token_not_active_yet', 'not-active-yet'];

function isClockSkewError(msg: string): boolean {
  return CLOCK_SKEW_ERRORS.some((key) => msg.toLowerCase().includes(key));
}

export function useCart() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const cartStore = useCartStore();
  const syncAttempts = useRef(0);
  const {
    items,
    isOpen,
    addItem: addItemToStore,
    removeItem: removeItemFromStore,
    updateQuantity: updateQuantityInStore,
    clearCart: clearCartStore,
    setOpen,
  } = cartStore;

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      useCartStore.setState({ items: [] });
      syncAttempts.current = 0;
      return;
    }

    let mounted = true;

    const loadServerCart = async (retryDelay = 0) => {
      if (retryDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
      if (!mounted) return;

      try {
        const serverItems = await cartService.getCart();
        if (!mounted) return;

        syncAttempts.current = 0;

        if (serverItems.length > 0) {
          useCartStore.setState({ items: serverItems });
          return;
        }

        const localItems = useCartStore.getState().items;
        if (localItems.length > 0) {
          for (const item of localItems) {
            await cartService.addItem({ variantId: item.variantId, quantity: item.quantity });
          }
          const synced = await cartService.getCart();
          if (mounted) useCartStore.setState({ items: synced });
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);

        if (isClockSkewError(msg) && syncAttempts.current < 3) {
          // Token not yet active — retry with exponential backoff (2s, 4s, 8s)
          syncAttempts.current += 1;
          const delay = 2000 * syncAttempts.current;
          void loadServerCart(delay);
          return;
        }

        // Only warn once per session for non-clock-skew errors
        if (!isClockSkewError(msg)) {
          console.warn('Cart sync warning:', msg);
        }
      }
    };

    void loadServerCart();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn]);

  const syncWithBackend = useCallback(async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (!isClockSkewError(msg)) {
        console.warn('Backend sync warning:', msg);
      }
    }
  }, []);

  const addToCart = useCallback(
    async (item: CartItem) => {
      addItemToStore(item);
      toast.success(`Đã thêm ${item.productName} vào giỏ hàng`);

      if (isSignedIn) {
        await syncWithBackend(async () => {
          await cartService.addItem({
            variantId: item.variantId,
            quantity: item.quantity,
          });
        });
      }
    },
    [addItemToStore, isSignedIn, syncWithBackend],
  );

  const removeFromCart = useCallback(
    async (variantId: number) => {
      const item = items.find((i) => i.variantId === variantId);
      removeItemFromStore(variantId);

      if (item) {
        toast.info(`Đã xóa ${item.productName} khỏi giỏ hàng`);
      }

      if (isSignedIn) {
        await syncWithBackend(async () => {
          await cartService.removeItem(variantId);
        });
      }
    },
    [items, removeItemFromStore, isSignedIn, syncWithBackend],
  );

  const updateQuantity = useCallback(
    async (variantId: number, quantity: number) => {
      updateQuantityInStore(variantId, quantity);

      if (isSignedIn) {
        await syncWithBackend(async () => {
          await cartService.updateQuantity(variantId, quantity);
        });
      }
    },
    [updateQuantityInStore, isSignedIn, syncWithBackend],
  );

  const clearCart = useCallback(async () => {
    clearCartStore();
    if (isSignedIn) {
      await syncWithBackend(async () => {
        await cartService.clearCart();
      });
    }
  }, [clearCartStore, isSignedIn, syncWithBackend]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return {
    items,
    isOpen,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setOpen,
  };
}
