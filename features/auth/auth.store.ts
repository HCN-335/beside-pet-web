/**
 * features/auth/auth.store.ts — app-wide auth state + use cases (actions).
 * Feature-Sliced: one store, components subscribe via selectors. Absence = `undefined`.
 * Unlike the admin store, this never loads the account list — a viewer can sign in
 * without touching admin-only endpoints. Role-based routing lives in the pages.
 */
import { create } from 'zustand';
import * as api from './auth.api';
import type { Principal } from './auth.types';

interface AuthState {
  principal?: Principal;
  ready: boolean; // initial /me check finished
  busy: boolean; // a login/setup is in flight
  error?: string;
  setupRequired: boolean; // backend has no admin yet → show first-run setup

  init: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  setup: (token: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Request failed.';

export const useAuthStore = create<AuthState>((set) => ({
  principal: undefined,
  ready: false,
  busy: false,
  error: undefined,
  setupRequired: false,

  async init() {
    try {
      const principal = await api.me();
      set({ principal, setupRequired: false });
    } catch {
      set({ principal: undefined });
      // Signed out — check whether the backend still needs its first admin.
      try {
        const status = await api.setupStatus();
        set({ setupRequired: status.required });
      } catch {
        set({ setupRequired: false });
      }
    } finally {
      set({ ready: true });
    }
  },

  async login(username, password) {
    set({ busy: true, error: undefined });
    try {
      await api.login(username, password);
      const principal = await api.me();
      set({ principal });
    } catch (error) {
      set({ error: messageOf(error) });
    } finally {
      set({ busy: false });
    }
  },

  async setup(token, username, password) {
    set({ busy: true, error: undefined });
    try {
      await api.setup(token, username, password);
      const principal = await api.me();
      set({ principal, setupRequired: false });
    } catch (error) {
      set({ error: messageOf(error) });
    } finally {
      set({ busy: false });
    }
  },

  async logout() {
    try {
      await api.logout();
    } finally {
      set({ principal: undefined });
    }
  },
}));
