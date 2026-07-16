/**
 * features/admin/admin.api.ts — real backend client for the admin console.
 * Sends the httpOnly auth cookie (credentials: 'include'); never holds the JWT in JS.
 * Base URL comes from NEXT_PUBLIC_API_BASE_URL (defaults to the local backend).
 */
import type { Account, CreateAccountInput } from './admin.types';

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

export const listAccounts = (): Promise<Account[]> => request('/v1/admin/accounts');

export const createAccount = (input: CreateAccountInput): Promise<Account> =>
  request('/v1/admin/accounts', { method: 'POST', body: JSON.stringify(input) });

export const revokeAccount = (id: string): Promise<Account> =>
  request(`/v1/admin/accounts/${id}/revoke`, { method: 'POST' });

export const softDeleteAccount = (id: string): Promise<Account> =>
  request(`/v1/admin/accounts/${id}/soft-delete`, { method: 'POST' });

export const reactivateAccount = (id: string): Promise<Account> =>
  request(`/v1/admin/accounts/${id}/reactivate`, { method: 'POST' });

export const setAccountExpiry = (id: string, expiresAt?: string): Promise<Account> =>
  request(`/v1/admin/accounts/${id}/expiry`, {
    method: 'PATCH',
    body: JSON.stringify({ expiresAt }),
  });
