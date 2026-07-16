/**
 * lib/data — the app's single gateway to backend data.
 * UI and stores call THIS, never lib/api or lib/cache directly. Caching lives
 * only here: each cached read owns a createCache instance + its keys + its
 * invalidation, co-located. Mutations call the api and invalidate affected caches.
 *
 * Today there are only mutations (the live conversation), so nothing is cached
 * yet. Cached reads (session history, profile, …) slot in here. Example:
 *
 *   const historyCache = createCache<SessionSummary[]>(60_000);
 *   export async function getHistory(userId: string): Promise<SessionSummary[]> {
 *     const cached = historyCache.get(userId);
 *     if (cached) return cached;
 *     const fresh = await api.getHistory(userId);
 *     historyCache.set(userId, fresh);
 *     return fresh;
 *   }
 *   // startSession() would then call historyCache.invalidate(userId).
 */
import type { GriefProfile, SessionListItem, StreamEvent, TurnResult } from '@/lib/api';
import { api } from '@/lib/api';

/** `griefProfile` present = first-time (onboarding); omitted = continue from history. */
export function startSession(sessionId: string, griefProfile?: GriefProfile): Promise<TurnResult> {
  return api.start({ sessionId, griefProfile });
}

export function sendMessage(sessionId: string, text: string): Promise<TurnResult> {
  return api.sendMessage(sessionId, text);
}

export function startSessionStream(
  sessionId: string,
  griefProfile?: GriefProfile,
): AsyncIterable<StreamEvent> {
  return api.startStream({ sessionId, griefProfile });
}

export function sendMessageStream(sessionId: string, text: string): AsyncIterable<StreamEvent> {
  return api.sendMessageStream(sessionId, text);
}

export function listSessions(): Promise<SessionListItem[]> {
  return api.listSessions();
}
