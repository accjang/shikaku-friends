// 설정(효과음·진동·언어). 언어가 null이면 기기 언어를 따른다.
import { getLocales } from 'expo-localization';
import { create } from 'zustand';

import { STORAGE_KEYS } from '@/core/config';
import { LOCALES, pickLocale, type Locale } from '@/core/i18n';

import { loadJson, saveJson } from './storage';

export interface Settings {
  sound: boolean;
  haptics: boolean;
  locale: Locale | null;
}

const DEFAULTS: Settings = { sound: true, haptics: true, locale: null };

interface SettingsStore extends Settings {
  hydrated: boolean;
  hydrate(): Promise<void>;
  patch(p: Partial<Settings>): void;
}

function sanitize(raw: unknown): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Settings>;
  return {
    sound: typeof r.sound === 'boolean' ? r.sound : DEFAULTS.sound,
    haptics: typeof r.haptics === 'boolean' ? r.haptics : DEFAULTS.haptics,
    locale: r.locale && (LOCALES as readonly string[]).includes(r.locale) ? r.locale : null,
  };
}

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  ...DEFAULTS,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    set({ ...sanitize(await loadJson<unknown>(STORAGE_KEYS.settings, null)), hydrated: true });
  },
  patch: (p) => {
    set(p);
    const { sound, haptics, locale } = get();
    void saveJson<Settings>(STORAGE_KEYS.settings, { sound, haptics, locale });
  },
}));

export function deviceLocale(): Locale {
  try {
    return pickLocale(getLocales().map((l) => l.languageTag));
  } catch {
    return 'en';
  }
}
