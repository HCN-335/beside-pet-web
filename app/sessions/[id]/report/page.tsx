'use client';

/**
 * /sessions/[id]/report — the mind report of one wrapped-up session.
 * Available only when the session carried enough of the journey
 * (state.reportAvailable); otherwise a gentle notice explains why.
 */
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from '@/i18n/I18nProvider';
import type { MindReport, SessionStateView } from '@/lib/api';
import { getReport, getSessionState } from '@/lib/data';

type ReportStatus = 'loading' | 'ready' | 'unavailable' | 'failed';

export default function SessionReportPage() {
  const labels = useTranslations();
  const translations = labels.sessionDetail;
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const [state, setState] = useState<SessionStateView>();
  const [report, setReport] = useState<MindReport>();
  const [status, setStatus] = useState<ReportStatus>('loading');

  useEffect(() => {
    let active = true;
    getSessionState(sessionId)
      .then((stateView) => {
        if (!active) return undefined;
        setState(stateView);
        if (!stateView.reportAvailable) {
          setStatus('unavailable');
          return undefined;
        }
        return getReport(sessionId).then((mindReport) => {
          if (!active) return;
          setReport(mindReport);
          setStatus('ready');
        });
      })
      .catch(() => active && setStatus('failed'));
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <header className="space-y-3">
        <Link href="/sessions" className="text-sm text-muted underline hover:text-foreground">
          ← {translations.back}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">{translations.reportTitle}</h1>
          {state && <p className="text-xs text-muted">{Math.round(state.progress * 100)}%</p>}
        </div>
      </header>

      <section className="mt-6 space-y-3">
        {status === 'loading' && <p className="text-sm text-muted">{translations.reportLoading}</p>}
        {status === 'unavailable' && (
          <p className="text-sm leading-relaxed text-muted">{translations.reportNotReady}</p>
        )}
        {status === 'failed' && <p className="text-sm text-muted">{translations.reportFailed}</p>}
        {status === 'ready' &&
          report?.sections.map((section) => (
            <article
              key={section.key}
              className="space-y-1 rounded-xl border border-black/5 bg-surface px-4 py-3"
            >
              <h3 className="text-sm font-medium text-accent">
                {labels.reportSections[section.key]}
              </h3>
              <p className="text-[15px] leading-relaxed">{section.body}</p>
            </article>
          ))}
      </section>
    </main>
  );
}
