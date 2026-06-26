'use client';

// Client-side API client for calling the NestJS backend.
// Injects the Clerk session token as a Bearer header so the
// ClerkAuthGuard on the API can verify the request.
import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';
import { ApiError } from './api-error';

// NEXT_PUBLIC_API_URL already includes the `/api` global prefix,
// e.g. http://localhost:4000/api
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export type ApiFetch = <T = unknown>(
  path: string,
  init?: RequestInit,
) => Promise<T>;

export function useApi(): ApiFetch {
  const { getToken } = useAuth();

  return useCallback<ApiFetch>(
    async (path, init) => {
      const token = await getToken();

      const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init?.headers,
        },
      });

      if (!res.ok) {
        const body = await res.text();
        throw new ApiError(res.status, body || res.statusText);
      }

      // 204 No Content (e.g. DELETE)
      if (res.status === 204) {
        return undefined as never;
      }

      return res.json();
    },
    [getToken],
  );
}
