/**
 * features/auth/auth.types.ts — identity types shared across the app.
 * Auth owns Role and Principal; other features (e.g. admin) import Role from here.
 */
export type Role = 'admin' | 'viewer';

/** Minimal identity returned by /v1/auth/me. */
export interface Principal {
  id: string;
  username: string;
  company: string;
  role: Role;
}
