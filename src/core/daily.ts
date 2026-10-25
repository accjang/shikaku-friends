// 오늘의 퍼즐: 기기 현지 날짜로 시드를 정해 모두 같은 퍼즐을 푼다.
import { DAILY_OPTIONS } from './config';
import { generate } from './generator';
import type { Puzzle } from './puzzle';
import { hashSeed } from './random';

const pad = (n: number): string => String(n).padStart(2, '0');

/** 현지 날짜 키(YYYY-MM-DD). */
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 하루 전 날짜 키. */
export function prevDateKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d - 1));
}

export function isDateKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key);
}

export function dailyPuzzle(key: string): Puzzle {
  for (let attempt = 0; ; attempt++) {
    const p = generate(hashSeed(`daily:${key}:${attempt}`), DAILY_OPTIONS);
    if (p) return p;
  }
}
