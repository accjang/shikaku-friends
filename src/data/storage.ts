// AsyncStorage 얇은 래퍼. 값은 { version, data } 봉투로 JSON 저장한다(웹에서는 localStorage).
// 읽기·쓰기 실패나 다른 버전 값은 기본값으로 본다(앱이 죽는 것보다 기본값이 낫다).
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_VERSION } from '@/core/config';

interface Envelope<T> {
  version: number;
  data: T;
}

function isEnvelope(value: unknown): value is Envelope<unknown> {
  return value !== null && typeof value === 'object' && 'version' in value && 'data' in value;
}

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isEnvelope(parsed) || parsed.version !== STORAGE_VERSION) return fallback;
    return parsed.data as T;
  } catch {
    return fallback;
  }
}

export async function saveJson<T>(key: string, value: T): Promise<void> {
  const envelope: Envelope<T> = { version: STORAGE_VERSION, data: value };
  try {
    await AsyncStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // 저장 실패는 조용히 넘긴다(메모리 상태는 그대로 남는다).
  }
}
