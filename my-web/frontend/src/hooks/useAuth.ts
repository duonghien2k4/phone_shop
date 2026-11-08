/**
 * useAuth Hook
 * Custom React hook for controlling authentication actions, endpoints, and status.
 *
 * Related: src/store/useAuthStore.ts, src/lib/api-client.ts
 * Pattern: Custom Hook for authentication facade
 */

'use client';

import { type AuthUser, useAuthStore } from '@/store/useAuthStore';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { authService, LoginDto, RegisterDto } from '@/services/auth.service';
import { setLocalTokenGetter } from '@/lib/api-client';
import { toast } from '@/store/useToastStore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';

export function useAuth() {
  const router = useRouter();
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useClerkAuth();
  const { user, accessToken, isInitialized, setUser, setAccessToken, setInitialized, logout: clearStore } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart);

  // Register local JWT getter so api-client can attach it to authenticated requests
  useEffect(() => {
    setLocalTokenGetter(() => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem('phoneshop-access-token');
    });
    return () => setLocalTokenGetter(null);
  }, []);

  // Initialize and check current session
  const initializeAuth = useCallback(async () => {
    if (isInitialized || !isClerkLoaded) return;

    const localToken =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('phoneshop-access-token')
        : null;

    if (!localToken && !isClerkSignedIn) {
      setInitialized(true);
      return;
    }

    try {
      const profile = await authService.getProfile();
      if (profile) {
        setUser(profile);
      }
    } catch {
      // Silently ignore initialization errors (means guest user)
    } finally {
      setInitialized(true);
    }
  }, [isInitialized, isClerkLoaded, isClerkSignedIn, setUser, setInitialized]);

  // Run initialization once on app load
  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  // Login handler
  const login = useCallback(
    async (
      credentials: LoginDto,
      options?: { requiredRole?: AuthUser['role']; redirect?: boolean },
    ) => {
      try {
        const data = await authService.login(credentials);

        if (options?.requiredRole && data.user.role !== options.requiredRole) {
          throw new Error('Tài khoản này không có quyền truy cập trang quản trị.');
        }

        setUser(data.user);
        if (data.accessToken && data.accessToken !== 'demo-access-token') {
          setAccessToken(data.accessToken);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('phoneshop-access-token', data.accessToken);
          }
        }
        toast.success(`Chao mung tro lai, ${data.user.fullName || data.user.email}!`);

        // Redirect based on role
        if (options?.redirect !== false) {
          if (data.user.role === 'ADMIN' || data.user.role === 'STAFF') {
            router.push('/admin');
          } else {
            router.push('/shop');
          }
        }
        return data.user;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Dang nhap that bai. Vui long kiem tra lai thong tin.';
        toast.error(message);
        throw err;
      }
    },
    [setUser, setAccessToken, router]
  );

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Fallback local cleanup even if server request fails
    } finally {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('phoneshop-access-token');
      }
      clearStore();
      clearCart();
      toast.info('Ban da dang xuat thanh cong.');
      router.push('/shop');
    }
  }, [clearStore, clearCart, router]);

  // Register handler
  const register = useCallback(
    async (data: RegisterDto) => {
      try {
        await authService.register(data);
        toast.success('Dang ky tai khoan thanh cong! Tien hanh dang nhap.');
        router.push('/login');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Dang ky that bai. Vui long kiem tra lai thong tin.';
        toast.error(message);
        throw err;
      }
    },
    [router]
  );

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(user || isClerkSignedIn),
    isInitialized: isInitialized && isClerkLoaded,
    isCustomer: user?.role === 'CUSTOMER',
    isStaff: user?.role === 'STAFF',
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
  };
}