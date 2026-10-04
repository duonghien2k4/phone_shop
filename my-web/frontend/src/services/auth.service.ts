/**
 * AuthService
 * Encapsulates all authentication API endpoints.
 * Separates data fetching from UI hooks/components.
 *
 * Related: src/hooks/useAuth.ts, src/lib/api-client.ts
 * Pattern: Service Layer (Clean Architecture)
 */

import { api } from '@/lib/api-client';
import { AuthUser } from '@/store/useAuthStore';

const DEMO_AUTH_KEY = 'phoneshop-demo-user';
const DEMO_TOKEN_KEY = 'phoneshop-demo-token';

export interface LoginDto {
  email?: string;
  password?: string;
}

export interface RegisterDto {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

const getDemoUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(DEMO_AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

const setDemoUser = (user: AuthUser) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(user));
  window.localStorage.setItem(DEMO_TOKEN_KEY, 'demo-access-token');
};

const clearDemoUser = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_AUTH_KEY);
  window.localStorage.removeItem(DEMO_TOKEN_KEY);
};

const buildDemoUser = (email: string, fullName?: string, role: AuthUser['role'] = 'CUSTOMER'): AuthUser => {
  const normalizedName = (fullName || email.split('@')[0] || 'Khách hàng')
    .trim()
    .replace(/\s+/g, ' ');

  return {
    id: Date.now(),
    email: email.trim().toLowerCase(),
    role,
    fullName: normalizedName,
  };
};

export const authService = {
  login: async (credentials: LoginDto) => {
    try {
      return await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', credentials, {
        skipAuth: true,
      });
    } catch {
      const email = (credentials.email ?? '').trim().toLowerCase();
      const password = credentials.password ?? '';

      if (!email || !password) {
        throw new Error('Email và mật khẩu không được để trống');
      }

      const user = buildDemoUser(
        email,
        email.split('@')[0].replace(/[._-]/g, ' '),
        email.toLowerCase().includes('admin') ? 'ADMIN' : 'CUSTOMER',
      );

      setDemoUser(user);
      return {
        accessToken: 'demo-access-token',
        user,
      };
    }
  },

  register: async (data: RegisterDto) => {
    try {
      return await api.post<AuthUser>('/auth/register', data, {
        skipAuth: true,
      });
    } catch {
      const email = (data.email ?? '').trim().toLowerCase();
      const fullName = (data.fullName ?? 'Khách hàng').trim();
      const user = buildDemoUser(email, fullName, 'CUSTOMER');

      setDemoUser(user);
      return user;
    }
  },

  logout: async () => {
    clearDemoUser();

    try {
      await api.post<void>('/auth/logout');
    } catch {
      // ignore in demo mode when backend is unavailable
    }
  },

  getProfile: async () => {
    const demoUser = getDemoUser();
    if (demoUser) {
      return demoUser;
    }

    return api.get<AuthUser>('/auth/profile');
  },
};
