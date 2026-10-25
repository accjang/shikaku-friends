import { describe, expect, test } from '@jest/globals';

import { levelId } from '../src/core/chapters';
import { PROP_EVERY } from '../src/core/config';
import { LOCALES, PROP_NAMES } from '../src/core/i18n';
import { INITIAL_PROGRESS, recordLevelClear } from '../src/core/progress';
import { dailyNumber, dailyShareText, hintStrip, stageShareText } from '../src/core/share';
import { newlyUnlockedProp, nextProp, PROP_IDS, stagesCleared, unlockedProps, villageFriends } from '../src/core/village';

describe('마을 꾸미기', () => {
  test('스테이지 10개마다 소품 하나, 200개에 20개(마지막은 집)', () => {
    expect(PROP_IDS).toHaveLength(20);
    expect(unlockedProps(0)).toEqual([]);
    expect(unlockedProps(PROP_EVERY - 1)).toEqual([]);
    expect(unlockedProps(PROP_EVERY)).toEqual(['flowers']);
    expect(unlockedProps(200)).toHaveLength(20);
    expect(unlockedProps(200)[19]).toBe('house');
    expect(nextProp(13)).toEqual({ id: 'bunting', remaining: 7 });
    expect(nextProp(200)).toBeNull();
  });

  test('이번 클리어로 새로 얻은 소품', () => {
    expect(newlyUnlockedProp(9, 10)).toBe('flowers');
    expect(newlyUnlockedProp(10, 11)).toBeNull();
    expect(newlyUnlockedProp(19, 20)).toBe('bunting');
  });

  test('깬 스테이지 수는 같은 스테이지를 한 번만 센다(오늘의 퍼즐 제외)', () => {
    let p = recordLevelClear(INITIAL_PROGRESS, levelId(1, 1), 0, 1000).progress;
    p = recordLevelClear(p, levelId(1, 1), 0, 900).progress;
    p = recordLevelClear(p, levelId(1, 2), 0, 900).progress;
    expect(stagesCleared({ ...p, daily: { '2026-10-25': 1000 } })).toBe(2);
  });

  test('친구는 챕터가 열리면 마을에 온다', () => {
    expect(villageFriends(INITIAL_PROGRESS)).toEqual(['cat']);
  });

  test('모든 소품에 4개 언어 이름', () => {
    for (const id of PROP_IDS) for (const l of LOCALES) expect(PROP_NAMES[id][l].length).toBeGreaterThan(0);
  });
});

describe('공유 문구', () => {
  test('오늘의 퍼즐 번호', () => {
    expect(dailyNumber('2026-11-01')).toBe(1);
    expect(dailyNumber('2026-11-30')).toBe(30);
    expect(dailyNumber('2027-01-01')).toBe(62);
  });

  test('오늘의 퍼즐: 번호·시간·힌트·연속, 정답 모양은 없음', () => {
    const text = dailyShareText('ko', { dateKey: '2026-11-03', ms: 83_000, hintsUsed: 1, streak: 3 }, '');
    expect(text).toBe('시카쿠 프렌즈 오늘의 퍼즐 #3\n⏱ 1:23 · 💡 1 · 🔥 3일 연속\n🟨🟩🟩🟩🟩');
    expect(dailyShareText('en', { dateKey: '2026-11-03', ms: 5_000, hintsUsed: 0, streak: 1 }, 'https://x')).toContain('https://x');
    expect(hintStrip(9)).toBe('🟨🟨🟨🟨🟨');
  });

  test('스테이지', () => {
    expect(stageShareText('ko', { id: '2-15', stars: 2, ms: 61_000 }, '')).toBe('시카쿠 프렌즈 스테이지 2-15 클리어!\n⭐⭐☆ · ⏱ 1:01');
  });
});
