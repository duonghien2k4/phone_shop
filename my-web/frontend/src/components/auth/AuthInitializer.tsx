'use client';

/**
 * AuthInitializer
 * Client-side component that initializes local JWT auth on app startup.
 * Replaces ClerkTokenBridge - uses only internal auth system.
 */

import { useEffect } from 'react';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { setLocalTokenGetter } from '@/lib/api-client';

export default function AuthInitializer() {
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useClerkAuth();
  const { isInitialized, setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    // Register local JWT getter for api-client
    setLocalTokenGetter(() => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem('phoneshop-access-token');
    });

    return () => setLocalTokenGetter(null);
  }, []);

  useEffect(() => {
    if (isInitialized || !isClerkLoaded) return;

    const init = async () => {
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
        // Guest user - ignore error
      } finally {
        setInitialized(true);
      }
    };

    void init();
  }, [isInitialized, isClerkLoaded, isClerkSignedIn, setUser, setInitialized]);

  return null;
}
