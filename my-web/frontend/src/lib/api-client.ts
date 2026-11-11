/**
 * Centralized HTTP client for the NestJS API.
 * Supports two auth layers:
 *  Admin endpoints prefer the local JWT; customer endpoints prefer the Clerk
 *  session token, with local customer auth as a fallback.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  _isRetry?: boolean;
};

type ClerkTokenGetter = (options?: {
  template?: string;
  skipCache?: boolean;
}) => Promise<string | null>;

let clerkTokenGetter: ClerkTokenGetter | null = null;
let localTokenGetter: (() => string | null) | null = null;

export function setClerkTokenGetter(getter: ClerkTokenGetter | null): void {
  clerkTokenGetter = getter;
}

/** Register a synchronous getter for the local JWT access token. */
export function setLocalTokenGetter(getter: (() => string | null) | null): void {
  localTokenGetter = getter;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, _isRetry = false, ...fetchOptions } = options;
  const requiresAuth = !skipAuth || endpoint.startsWith('/admin/');
  const headers: Record<string, string> = {
    ...(fetchOptions.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (requiresAuth && !headers.Authorization) {
    const isAdminEndpoint = endpoint === '/admin' || endpoint.startsWith('/admin/');
    let token: string | null = null;

    if (isAdminEndpoint) {
      token = localTokenGetter ? localTokenGetter() : null;
      if (!token && clerkTokenGetter) {
        token = await clerkTokenGetter();
      }
    } else {
      token = clerkTokenGetter ? await clerkTokenGetter() : null;
      if (!token && localTokenGetter) {
        token = localTokenGetter();
      }
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  // If 401 and not already retried, force fresh token from Clerk and retry once
  if (response.status === 401 && requiresAuth && !_isRetry && clerkTokenGetter) {
    try {
      const freshToken = await clerkTokenGetter({ skipCache: true });
      if (freshToken) {
        return apiClient<T>(endpoint, {
          ...options,
          _isRetry: true,
          headers: {
            ...fetchOptions.headers,
            Authorization: `Bearer ${freshToken}`,
          },
        });
      }
    } catch {
      // Refresh failed, fall through to error handling
    }
  }

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string | string[];
      statusCode?: number;
    };
    const message = Array.isArray(errorData.message)
      ? errorData.message[0]
      : (errorData.message ?? 'Co loi xay ra');
    throw new ApiError(response.status, message, errorData);
  }

  const result = (await response.json()) as { data: T };
  return result.data;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
