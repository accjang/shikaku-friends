// 진행 기록 저장소(zustand + AsyncStorage). 규칙은 src/core/progress.ts.
import { create } from 'zustand';

import { STORAGE_KEYS } from '@/core/config';
import { INITIAL_PROGRESS, sanitizeProgress, type Progress } from '@/core/progress';

import { loadJson, saveJson } from './storage';

interface ProgressStore {
  progress: Progress;
  hydrated: boolean;
  hydrate(): Promise<void>;
  /** 새 진행 기록으로 바꾸고 저장한다. */
  set(next: Progress): void;
  update(fn: (p: Progress) => Progress): void;
}

export const useProgressStore = create<ProgressStore>()((set, get) => ({
  progress: { ...INITIAL_PROGRESS },
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await loadJson<unknown>(STORAGE_KEYS.progress, null);
    set({ progress: sanitizeProgress(raw), hydrated: true });
  },
  set: (next) => {
    set({ progress: next });
    void saveJson(STORAGE_KEYS.progress, next);
  },
  update: (fn) => get().set(fn(get().progress)),
}));
