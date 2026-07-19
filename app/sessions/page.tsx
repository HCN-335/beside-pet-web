'use client';

/**
 * /sessions — the returning viewer's home.
 * Lists the account's sessions (transcript / mind-report actions) and offers to
 * re-enter the ongoing conversation or start a new one. A new conversation
 * CONTINUES the journey: the backend inherits the profile and resumes at the
 * reached stage with cross-session context (no re-onboarding). Starting new
 * while a conversation is ongoing first wraps that one up (confirmed in a
 * dialog). Onboarding is only for first-timers (no sessions yet).
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSessionStore } from '@/features/session/session.store';
import { useTranslations } from '@/i18n/I18nProvider';
import type { SessionListItem } from '@/lib/api';
import { closeSession, listSessions } from '@/lib/data';

export default function SessionsPage() {
  const translations = useTranslations();
  const router = useRouter();
  const resumeSession = useSessionStore((state) => state.resumeSession);
  const startSession = useSessionStore((state) => state.startSession);
  const [items, setItems] = useState<SessionListItem[]>();
  const [confirmingNew, setConfirmingNew] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    listSessions()
      .then((sessions) => {
        if (!active) return;
        if (sessions.length === 0) {
          router.replace('/onboarding');
          return;
        }
        setItems(sessions);
      })
      .catch(() => active && router.replace('/onboarding'));
    return () => {
      active = false;
    };
  }, [router]);

  const openSession = items?.find((item) => !item.closed);

  const onContinue = () => {
    if (!openSession) return;
    void resumeSession(openSession.sessionId);
    router.push('/session');
  };

  const startNew = () => {
    void startSession(); // no profile → the backend resumes the journey from history
    router.push('/session');
  };

  const onStartNew = () => {
    if (openSession) {
      setConfirmingNew(true);
      return;
    }
    startNew();
  };

  const onConfirmNew = async () => {
    if (!openSession) return;
    setBusy(true);
    try {
      await closeSession(openSession.sessionId);
      startNew();
    } catch {
      setBusy(false);
      setConfirmingNew(false);
    }
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
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {translations.sessionList.title}
          </h1>
          <p className="text-muted">{translations.sessionList.subtitle}</p>
        </div>
        <Link
          href="/settings"
          className="shrink-0 rounded-lg border border-black/10 px-3 py-1.5 text-sm text-muted transition-colors hover:bg-black/5"
        >
          {translations.sessionList.settings}
        </Link>
      </header>

      <ul className="mt-6 space-y-2">
        {items.map((item) => (
          <li
            key={item.sessionId}
            className="space-y-3 rounded-xl border border-black/5 bg-surface px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">{item.taskLabel}</p>
                {item.petName && <p className="text-xs text-muted">{item.petName}</p>}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>{Math.round(item.progress * 100)}%</span>
                <span className={item.closed ? '' : 'font-medium text-accent'}>
                  {item.closed ? translations.sessionList.done : translations.sessionList.ongoing}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/sessions/${item.sessionId}`}
                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm transition-colors hover:bg-black/5"
              >
                {translations.sessionList.viewTranscript}
              </Link>
              {item.reportAvailable ? (
                <Link
                  href={`/sessions/${item.sessionId}/report`}
                  className="rounded-lg border border-accent/30 px-3 py-1.5 text-sm text-accent transition-colors hover:bg-accent/10"
                >
                  {translations.sessionList.viewReport}
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-lg border border-black/5 px-3 py-1.5 text-sm text-muted opacity-50">
                  {translations.sessionList.viewReport}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onContinue}
            disabled={!openSession}
            className="rounded-xl bg-accent px-6 py-3 font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {translations.sessionList.continueButton}
          </button>
          <button
            type="button"
            onClick={onStartNew}
            className="rounded-xl border border-black/10 px-6 py-3 font-medium transition-colors hover:bg-black/5"
          >
            {translations.sessionList.newButton}
          </button>
        </div>
        {!openSession && (
          <p className="text-xs text-muted">{translations.sessionList.noOpenHint}</p>
        )}
      </div>

      {confirmingNew && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-background p-6 shadow-xl">
            <h2 className="text-lg font-semibold">{translations.sessionList.confirmNewTitle}</h2>
            <p className="text-sm leading-relaxed text-muted">
              {translations.sessionList.confirmNewBody}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingNew(false)}
                disabled={busy}
                className="rounded-lg px-4 py-2 text-sm text-muted transition-colors hover:bg-black/5"
              >
                {translations.sessionList.cancel}
              </button>
              <button
                type="button"
                onClick={() => void onConfirmNew()}
                disabled={busy}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {translations.sessionList.confirmNewStart}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
