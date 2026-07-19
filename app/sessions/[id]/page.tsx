'use client';

/**
 * /sessions/[id] — one session's transcript.
 * Shows the full conversation record; the mind report lives on its own page
 * (/sessions/[id]/report). An ongoing session offers to re-enter the
 * conversation instead.
 */
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useSessionStore } from '@/features/session/session.store';
import { useTranslations } from '@/i18n/I18nProvider';
import type { HistoryMessage, SessionStateView } from '@/lib/api';
import { getMessages, getSessionState } from '@/lib/data';

export default function SessionDetailPage() {
  const translations = useTranslations().sessionDetail;
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const resumeSession = useSessionStore((state) => state.resumeSession);

  const [state, setState] = useState<SessionStateView>();
  const [history, setHistory] = useState<HistoryMessage[]>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getSessionState(sessionId), getMessages(sessionId)])
      .then(([stateView, messages]) => {
        if (!active) return;
        setState(stateView);
        setHistory(messages);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [sessionId]);

  const onContinue = () => {
    void resumeSession(sessionId);
    router.push('/session');
  };

  if (failed) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-muted">{translations.loadFailed}</p>
        <Link href="/sessions" className="font-medium text-accent underline">
          {translations.back}
        </Link>
      </main>
    );
  }

  if (!state || !history) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 text-muted">
        {translations.loading}
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <header className="space-y-3">
        <Link href="/sessions" className="text-sm text-muted underline hover:text-foreground">
          ← {translations.back}
        </Link>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight">{state.taskLabel}</h1>
            <p className="text-xs text-muted">{Math.round(state.progress * 100)}%</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              state.closed ? 'bg-black/5 text-muted' : 'bg-accent/10 font-medium text-accent'
            }`}
          >
            {state.closed ? translations.done : translations.ongoing}
          </span>
        </div>
      </header>

      <section className="mt-6 space-y-3">
        {history.map((message) => (
          <MessageBubble
            key={`${message.at}-${message.role}`}
            message={{
              id: `${message.at}-${message.role}`,
              role: message.role === 'user' ? 'user' : 'bot',
              text: message.text,
            }}
          />
        ))}
      </section>

      {!state.closed && (
        <div className="mt-8">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-xl bg-accent px-6 py-3 font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            {translations.continueButton}
          </button>
        </div>
      )}
    </main>
  );
}
