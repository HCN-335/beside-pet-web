/**
 * features/auth/auth.api.ts — real backend auth client (login / logout / me).
 * Sends the httpOnly auth cookie (credentials: 'include'); never holds the JWT
 * in JS. Base URL comes from NEXT_PUBLIC_API_BASE_URL (defaults to local backend).
 */
import type { Principal } from './auth.types';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

interface ErrorBody {
  message?: string | string[];
}

const extractError = async (res: Response): Promise<string> => {
  try {
    const body = (await res.json()) as ErrorBody;
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    // fall through to the status text
  }
  return `Request failed (${res.status})`;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(await extractError(res));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
};

export interface SetupStatus {
  required: boolean;
}

/** Is first-run admin setup still pending on the backend? */
export const setupStatus = (): Promise<SetupStatus> => request('/v1/auth/setup');

/** Exchange the one-time boot token for the first admin account (signs in). */
export const setup = (token: string, username: string, password: string): Promise<void> =>
  request('/v1/auth/setup', {
    method: 'POST',
    body: JSON.stringify({ token, username, password }),
  });

export const login = (username: string, password: string): Promise<void> =>
  request('/v1/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const logout = (): Promise<void> => request('/v1/auth/logout', { method: 'POST' });

export const me = (): Promise<Principal> => request('/v1/auth/me');
