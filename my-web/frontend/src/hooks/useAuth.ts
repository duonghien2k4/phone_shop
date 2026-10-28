/**
 * useAuth Hook
 * Custom React hook for controlling authentication actions, endpoints, and status.
 *
 * Related: src/store/useAuthStore.ts, src/lib/api-client.ts
 * Pattern: Custom Hook for authentication facade
 */

'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { authService, LoginDto, RegisterDto } from '@/services/auth.service';
import { setLocalTokenGetter } from '@/lib/api-client';
import { toast } from '@/store/useToastStore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';

export function useAuth() {
  const router = useRouter();
  const { isLoaded: isClerkLoaded, isSignedIn } = useClerkAuth();
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
    if (isInitialized) return;

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
  }, [isInitialized, setUser, setInitialized]);

  // Run initialization once on app load
  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  // Login handler
  const login = useCallback(
    async (credentials: LoginDto) => {
      try {
        const data = await authService.login(credentials);

        setUser(data.user);
        if (data.accessToken && data.accessToken !== 'demo-access-token') {
          setAccessToken(data.accessToken);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('phoneshop-access-token', data.accessToken);
          }
        }
        toast.success(`Chào mừng trở lại, ${data.user.fullName || data.user.email}!`);

        // Redirect based on role
        if (data.user.role === 'ADMIN' || data.user.role === 'STAFF') {
          router.push('/admin');
        } else {
          router.push('/shop');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
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
      toast.info('Bạn đã đăng xuất thành công.');
      router.push('/shop');
    }
  }, [clearStore, clearCart, router]);

  // Register handler
  const register = useCallback(
    async (data: RegisterDto) => {
      try {
        await authService.register(data);
        toast.success('Đăng ký tài khoản thành công! Tiến hành đăng nhập.');
        router.push('/login');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
        toast.error(message);
        throw err;
      }
    },
    [router]
  );

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(user || isSignedIn),
    isInitialized,
    isCustomer: user?.role === 'CUSTOMER',
    isStaff: user?.role === 'STAFF',
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
  };
}
