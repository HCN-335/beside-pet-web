'use client';

/**
 * /sessions — the returning viewer's home.
 * Lists the account's past sessions and offers to continue (resume where the last
 * one left off) or start a new conversation. First-timers (no sessions) are sent
 * straight to onboarding, so they never see an empty list.
 */
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSessionStore } from '@/features/session/session.store';
import { useLocale, useTranslations } from '@/i18n/I18nProvider';
import type { SessionListItem } from '@/lib/api';
import { listSessions } from '@/lib/data';

export default function SessionsPage() {
  const translations = useTranslations();
  const { setLocale } = useLocale();
  const router = useRouter();
  const startSession = useSessionStore((state) => state.startSession);
  const [items, setItems] = useState<SessionListItem[]>();

  useEffect(() => {
    let active = true;
    listSessions()
      .then((sessions) => {
        if (!active) return;
        if (sessions.length === 0) {
          router.replace('/onboarding');
          return;
        }
        // Restore the returning user's UI language from their most recent session.
        setLocale(sessions[0].preferredLanguage);
        setItems(sessions);
      })
      .catch(() => active && router.replace('/onboarding'));
    return () => {
      active = false;
    };
  }, [router, setLocale]);

  const onContinue = () => {
    void startSession(); // no profile → backend continues from history
    router.push('/session');
  };

  if (!items) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 text-muted">
        {translations.sessionList.loading}
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{translations.sessionList.title}</h1>
        <p className="text-muted">{translations.sessionList.subtitle}</p>
      </header>

      <ul className="mt-6 space-y-2">
        {items.map((item) => (
          <li
            key={item.sessionId}
            className="flex items-center justify-between rounded-xl border border-black/5 bg-surface px-4 py-3"
          >
            <div className="space-y-0.5">
              <p className="font-medium">{item.taskLabel}</p>
              {item.petName && <p className="text-xs text-muted">{item.petName}</p>}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>{Math.round(item.progress * 100)}%</span>
              <span>
                {item.closed ? translations.sessionList.done : translations.sessionList.ongoing}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-xl bg-accent px-6 py-3 font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          {translations.sessionList.continueButton}
        </button>
        <button
          type="button"
          onClick={() => router.push('/onboarding')}
          className="rounded-xl border border-black/10 px-6 py-3 font-medium transition-colors hover:bg-black/5"
        >
          {translations.sessionList.newButton}
        </button>
      </div>
    </main>
  );
}
