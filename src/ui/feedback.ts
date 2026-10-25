// 효과음(expo-audio)·진동(expo-haptics). 설정이 꺼져 있거나 모듈이 없으면(웹·테스트) 조용히 넘긴다.
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useSettingsStore } from '@/data/settingsStore';

const SOURCES = {
  tap: require('../../assets/sounds/tap.wav'),
  place: require('../../assets/sounds/place.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  erase: require('../../assets/sounds/erase.wav'),
  hint: require('../../assets/sounds/hint.wav'),
  clear: require('../../assets/sounds/clear.wav'),
} as const;

export type Sfx = keyof typeof SOURCES;

const players: Partial<Record<Sfx, AudioPlayer>> = {};
let audioReady = false;

function player(name: Sfx): AudioPlayer | null {
  try {
    if (!audioReady) {
      audioReady = true;
      // 무음 모드에서는 소리를 내지 않고, 다른 앱 음악은 끊지 않는다.
      void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => undefined);
    }
    players[name] ??= createAudioPlayer(SOURCES[name]);
    return players[name] ?? null;
  } catch {
    return null;
  }
}

export function playSfx(name: Sfx): void {
  if (!useSettingsStore.getState().sound) return;
  const p = player(name);
  if (!p) return;
  try {
    void p.seekTo(0);
    p.play();
  } catch {
    // 재생 실패는 무시
  }
}

type Buzz = 'light' | 'medium' | 'success' | 'error';

export function buzz(kind: Buzz): void {
  if (!useSettingsStore.getState().haptics || Platform.OS === 'web') return;
  const run = (): Promise<void> => {
    switch (kind) {
      case 'light':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'medium':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'error':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };
  try {
    void run().catch(() => undefined);
  } catch {
    // 모듈 없음
  }
}
