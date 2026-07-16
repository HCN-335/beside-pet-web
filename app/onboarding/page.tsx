'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ChoiceChips } from '@/components/chat/ChoiceChips';
import { Composer } from '@/components/chat/Composer';
import { MessageList } from '@/components/chat/MessageList';
import { useOnboardingStore } from '@/features/onboarding/onboarding.store';
import type { ChoiceOption } from '@/features/onboarding/onboarding.types';
import { useSessionStore } from '@/features/session/session.store';
import { useLocale, useTranslations } from '@/i18n/I18nProvider';
import { getMessages } from '@/i18n/registry';

export default function OnboardingPage() {
  const translations = useTranslations();
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const messages = useOnboardingStore((state) => state.messages);
  const status = useOnboardingStore((state) => state.status);
  const griefProfile = useOnboardingStore((state) => state.griefProfile);
  const input = useOnboardingStore((state) => state.input);
  const start = useOnboardingStore((state) => state.start);
  const answer = useOnboardingStore((state) => state.answer);
  const select = useOnboardingStore((state) => state.select);
  const skip = useOnboardingStore((state) => state.skip);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const startSession = useSessionStore((state) => state.startSession);

  // First question on entry (store.start is idempotent).
  useEffect(() => {
    start(translations);
  }, [start, translations]);

  // Language choice unifies UI + counseling: switch the app locale immediately and
  // render the rest of onboarding in the chosen language (using its catalog now, so
  // there's no one-question lag). Other choices go straight through.
  const onSelect = (option: ChoiceOption) => {
    const chosen = option.patch.preferredLanguage;
    if (chosen && chosen !== locale) {
      setLocale(chosen);
      select(getMessages(chosen), option);
    } else {
      select(translations, option);
    }
  };

  const beginSession = () => {
    // Kick off the session (sets status synchronously) and navigate immediately
    // so the greeting streams on the session screen rather than off-screen here.
    // preferredLanguage always matches the app locale (unified language).
    void startSession({
      ...griefProfile,
      preferredLanguage: griefProfile.preferredLanguage ?? locale,
    });
    resetOnboarding();
    router.push('/session');
  };

  const renderInput = () => {
    if (status === 'done') {
      return (
        <div className="border-t border-black/5 p-4 text-center">
          <button
            type="button"
            onClick={beginSession}
            className="rounded-xl bg-accent px-6 py-3 font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            {translations.onboarding.begin}
          </button>
        </div>
      );
    }
    if (input?.kind === 'choice') {
      return (
        <ChoiceChips
          options={input.options}
          onSelect={onSelect}
          onSkip={() => skip(translations)}
        />
      );
    }
    return (
      <Composer
        disabled={false}
        placeholder={input?.placeholder}
        onSend={(text) => answer(translations, text)}
      />
    );
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <MessageList messages={messages} />
      {renderInput()}
    </main>
  );
}
