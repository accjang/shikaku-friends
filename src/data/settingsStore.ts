// 설정(효과음·진동·언어·함께 다닐 친구). 언어가 null이면 기기 언어, 친구가 null이면 챕터 친구.
import { getLocales } from 'expo-localization';
import { create } from 'zustand';

import { CHAPTERS, type CharacterId } from '@/core/chapters';
import { STORAGE_KEYS } from '@/core/config';
import { LOCALES, pickLocale, type Locale } from '@/core/i18n';

import { loadJson, saveJson } from './storage';

export interface Settings {
  sound: boolean;
  haptics: boolean;
  locale: Locale | null;
  /** 모든 스테이지에 함께 다닐 친구(마을에서 고름). null이면 챕터마다 그 챕터 친구. */
  companion: CharacterId | null;
  /** 오늘의 퍼즐 알림(기본 꺼짐 — 켤 때 권한을 묻는다). */
  reminders: boolean;
  /** 알림을 켤지 한 번 물어봤는지(첫 오늘의 퍼즐 클리어 뒤 한 번만 묻는다). */
  reminderAsked: boolean;
}

const DEFAULTS: Settings = { sound: true, haptics: true, locale: null, companion: null, reminders: false, reminderAsked: false };
const CHARACTERS: readonly CharacterId[] = CHAPTERS.map((c) => c.character);

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
    companion: r.companion && CHARACTERS.includes(r.companion) ? r.companion : null,
    reminders: r.reminders === true,
    reminderAsked: r.reminderAsked === true,
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
    const { sound, haptics, locale, companion, reminders, reminderAsked } = get();
    void saveJson<Settings>(STORAGE_KEYS.settings, { sound, haptics, locale, companion, reminders, reminderAsked });
  },
}));

export function deviceLocale(): Locale {
  try {
    return pickLocale(getLocales().map((l) => l.languageTag));
  } catch {
    return 'en';
  }
}
