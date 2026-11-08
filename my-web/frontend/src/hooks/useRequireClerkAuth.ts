'use client';

import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRequireClerkAuth(): boolean {
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useClerkAuth();
  const { user: internalUser, isInitialized: isInternalLoaded } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isLoaded = isClerkLoaded && isInternalLoaded;
  const isSignedIn = Boolean(isClerkSignedIn || internalUser);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
    }
  }, [isLoaded, isSignedIn, pathname, router]);

  return isLoaded && isSignedIn;
}
