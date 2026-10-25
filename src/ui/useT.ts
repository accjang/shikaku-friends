// 지금 언어로 문구를 꺼내는 훅.
import { useCallback } from 'react';

import { translate, type Locale, type StringKey } from '@/core/i18n';
import { deviceLocale, useSettingsStore } from '@/data/settingsStore';

export function useLocale(): Locale {
  const chosen = useSettingsStore((s) => s.locale);
  return chosen ?? deviceLocale();
}

export function useT(): { t: (key: StringKey, vars?: Record<string, string | number>) => string; locale: Locale } {
  const locale = useLocale();
  const t = useCallback((key: StringKey, vars?: Record<string, string | number>) => translate(locale, key, vars), [locale]);
  return { t, locale };
}
