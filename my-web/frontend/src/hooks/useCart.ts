/**
 * useCart Hook
 * Custom React hook that abstracts all shopping cart logic.
 * Encapsulates the Zustand store and coordinates API sync if the user is authenticated.
 *
 * Related: src/store/useCartStore.ts, src/services/cart.service.ts
 * Pattern: Custom Hook for state abstraction (anti-leak store rule)
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cartService } from '@/services/cart.service';
import { toast } from '@/store/useToastStore';

export function useCart() {
  const { user } = useAuthStore();
  const cartStore = useCartStore();
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
    if (!user) return;

    let mounted = true;

    const loadServerCart = async () => {
      try {
        const serverItems = await cartService.getCart();
        if (!mounted) return;

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
          useCartStore.setState({ items: synced });
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn('Cart sync warning:', msg);
      }
    };

    void loadServerCart();

    return () => {
      mounted = false;
    };
  }, [user]);

  const syncWithBackend = useCallback(async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn('Backend sync warning:', msg);
    }
  }, []);

  const addToCart = useCallback(
    async (item: CartItem) => {
      addItemToStore(item);
      toast.success(`Đã thêm ${item.productName} vào giỏ hàng`);

      if (user) {
        await syncWithBackend(async () => {
          await cartService.addItem({
            variantId: item.variantId,
            quantity: item.quantity,
          });
        });
      }
    },
    [addItemToStore, user, syncWithBackend],
  );

  const removeFromCart = useCallback(
    async (variantId: number) => {
      const item = items.find((i) => i.variantId === variantId);
      removeItemFromStore(variantId);

      if (item) {
        toast.info(`Đã xóa ${item.productName} khỏi giỏ hàng`);
      }

      if (user) {
        await syncWithBackend(async () => {
          await cartService.removeItem(variantId);
        });
      }
    },
    [items, removeItemFromStore, user, syncWithBackend],
  );

  const updateQuantity = useCallback(
    async (variantId: number, quantity: number) => {
      updateQuantityInStore(variantId, quantity);

      if (user) {
        await syncWithBackend(async () => {
          await cartService.updateQuantity(variantId, quantity);
        });
      }
    },
    [updateQuantityInStore, user, syncWithBackend],
  );

  const clearCart = useCallback(async () => {
    clearCartStore();
    if (user) {
      await syncWithBackend(async () => {
        await cartService.clearCart();
      });
    }
  }, [clearCartStore, user, syncWithBackend]);

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
