'use client';

/**
 * /settings — the viewer's preferences.
 * Conversation language (account-level, applies from the next reply) and the
 * app UI language (locale cookie). Both are changeable at any time.
 */
import Link from 'next/link';
import { ChatLanguageSelect } from '@/features/auth/components/ChatLanguageSelect';
import { isLocale, LOCALE_LABELS, LOCALES } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/I18nProvider';

export default function SettingsPage() {
  const translations = useTranslations();
  const { locale, setLocale } = useLocale();

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
          <label className="flex items-center gap-2 text-xs text-muted">
            <span>{translations.settings.uiLanguage}</span>
            <select
              value={locale}
              onChange={(event) => {
                if (isLocale(event.target.value)) {
                  setLocale(event.target.value);
                }
              }}
              className="rounded-md border border-black/15 bg-background px-2 py-1 outline-none focus:border-accent"
            >
              {LOCALES.map((candidate) => (
                <option key={candidate} value={candidate}>
                  {LOCALE_LABELS[candidate]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
    </main>
  );
}
