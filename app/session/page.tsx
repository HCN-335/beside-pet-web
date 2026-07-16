'use client';

import Link from 'next/link';
import { Composer } from '@/components/chat/Composer';
import { MessageList } from '@/components/chat/MessageList';
import { CrisisResources } from '@/features/safety/components/CrisisResources';
import { ProgressBar } from '@/features/session/components/ProgressBar';
import { useSessionStore } from '@/features/session/session.store';
import { useTranslations } from '@/i18n/I18nProvider';

export default function SessionPage() {
  const translations = useTranslations();
  const status = useSessionStore((state) => state.status);
  const messages = useSessionStore((state) => state.messages);
  const taskLabel = useSessionStore((state) => state.taskLabel);
  const progress = useSessionStore((state) => state.progress);
  const supportLevel = useSessionStore((state) => state.supportLevel);
  const streaming = useSessionStore((state) => state.streaming);
  const sendUserMessage = useSessionStore((state) => state.sendUserMessage);
  const reset = useSessionStore((state) => state.reset);

  if (status === 'idle') {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="space-y-3 text-center">
          <p className="text-muted">{translations.session.noSession}</p>
          <Link href="/" className="inline-block font-medium text-accent underline">
            {translations.session.toHome}
          </Link>
        </div>
      </main>
    );
  }

  const closed = status === 'closed';

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-background/95 px-4 py-3 backdrop-blur">
        <ProgressBar taskLabel={taskLabel} progress={progress} />
      </header>

      <MessageList messages={messages} />

      {supportLevel >= 3 && <CrisisResources />}

      {closed ? (
        <div className="space-y-3 border-t border-black/5 p-4 text-center">
          <p className="text-sm text-muted">{translations.session.closed}</p>
          <Link
            href="/"
            onClick={() => reset()}
            className="inline-block font-medium text-accent underline"
          >
            {translations.session.toHome}
          </Link>
        </div>
      ) : (
        <Composer disabled={streaming} onSend={(text) => sendUserMessage(text)} />
      )}
    </main>
  );
}
