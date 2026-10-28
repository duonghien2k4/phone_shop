'use client';

import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRequireClerkAuth(): boolean {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
    }
  }, [isLoaded, isSignedIn, pathname, router]);

  return isLoaded && Boolean(isSignedIn);
}
