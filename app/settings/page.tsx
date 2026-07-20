'use client';

/**
 * /settings — the viewer's preferences.
 * Conversation language (account-level, applies from the next reply) and the
 * app UI language (locale cookie). Both are changeable at any time.
 */
import Link from 'next/link';
import { ChatLanguageSelect } from '@/features/auth/components/ChatLanguageSelect';
import { useTranslations } from '@/i18n/I18nProvider';
import { LocaleSelect } from '@/i18n/LocaleSelect';

export default function SettingsPage() {
  const translations = useTranslations();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <header className="space-y-3">
        <Link href="/sessions" className="text-sm text-muted underline hover:text-foreground">
          ← {translations.settings.back}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{translations.settings.title}</h1>
      </header>

      <section className="mt-6 space-y-4">
        <div className="space-y-2 rounded-xl border border-black/5 bg-surface px-4 py-4">
          <ChatLanguageSelect />
          <p className="text-xs text-muted">{translations.settings.chatLanguageHint}</p>
        </div>

        <div className="rounded-xl border border-black/5 bg-surface px-4 py-4">
          <LocaleSelect />
        </div>
      </section>
    </main>
  );
}
