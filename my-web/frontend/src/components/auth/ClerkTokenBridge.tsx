'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setClerkTokenGetter } from '@/lib/api-client';

export default function ClerkTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setClerkTokenGetter(getToken);
    return () => setClerkTokenGetter(null);
  }, [getToken]);

  return null;
}
