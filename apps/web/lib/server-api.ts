import 'server-only';

// Server-side API client (Server Components, Route Handlers, Server Actions).
// Pulls the Clerk token via the async `auth()` helper and forwards it as Bearer.
import { auth } from '@clerk/nextjs/server';
import { ApiError } from './api-error';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function serverApi<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    // Auth-scoped data should never be cached across users.
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body || res.statusText);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
