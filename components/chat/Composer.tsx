'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/I18nProvider';

/** Text input — knows nothing about flow/state; just delegates via onSend. Shared. */
export function Composer({
  disabled,
  placeholder,
  onSend,
}: {
  disabled: boolean;
  placeholder?: string;
  onSend: (text: string) => void;
}) {
  const translations = useTranslations();
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <form
      className="flex items-center gap-2 border-t border-black/5 bg-surface px-4 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? translations.chat.placeholder}
        className="flex-1 rounded-xl border border-black/10 bg-background px-4 py-2.5 outline-none focus:border-accent disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {translations.chat.send}
      </button>
    </form>
  );
}
