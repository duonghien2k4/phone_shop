'use client';

/**
 * AuthInitializer
 * Client-side component that initializes local JWT auth on app startup.
 * Replaces ClerkTokenBridge - uses only internal auth system.
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { setLocalTokenGetter } from '@/lib/api-client';

export default function AuthInitializer() {
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
    if (isInitialized) return;

    const init = async () => {
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
  }, [isInitialized, setUser, setInitialized]);

  return null;
}

