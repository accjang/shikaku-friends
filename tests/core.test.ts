import { describe, expect, test } from '@jest/globals';

import levelsJson from '../content/levels.json';
import { shouldOfferAdFree, shouldShowInterstitial } from '../src/core/adPolicy';
import { CHAPTERS, levelCount, levelId, levelOptions, parseLevelId } from '../src/core/chapters';
import { LEVEL_MAX_BRANCHES, AD_FREE_FIRST_CLEARS, AD_FREE_OFFER_AFTER_INTERSTITIALS, AD_INTERSTITIAL_EVERY, CHAPTER_UNLOCK_CLEARS, START_HINTS } from '../src/core/config';
import { dailyPuzzle, dateKey, prevDateKey } from '../src/core/daily';
import { applyHint, clearAll, newGame, place, removeAt, undo } from '../src/core/game';
import { generate } from '../src/core/generator';
import { characterLine, LOCALES, missingKeys, pickLocale, translate, translateKeys } from '../src/core/i18n';
import { unpack, type PackedPuzzle } from '../src/core/levelCodec';
import {
  INITIAL_PROGRESS,
  dailyStreak,
  isChapterUnlocked,
  isLevelUnlocked,
  nextUnplayed,
  recordDailyClear,
  recordLevelClear,
  sanitizeProgress,
  starsFor,
  streakCycleDay,
  streakReward,
} from '../src/core/progress';
import { isSolved, rectFromCorners, validClueIndex, type Puzzle } from '../src/core/puzzle';
import { solve } from '../src/core/solver';

const levels = levelsJson as unknown as Record<string, PackedPuzzle>;

// 2×2 판: 숫자 2 두 개(세로로 나뉘는 답 하나)
const tiny: Puzzle = {
  w: 2,
  h: 2,
  clues: [
    { x: 0, y: 0, n: 2 },
    { x: 1, y: 1, n: 2 },
  ],
  solution: [
    { x: 0, y: 0, w: 1, h: 2 },
    { x: 1, y: 0, w: 1, h: 2 },
  ],
};

describe('규칙', () => {
  test('직사각형 판정', () => {
    expect(rectFromCorners(1, 1, 0, 0)).toEqual({ x: 0, y: 0, w: 2, h: 2 });
    expect(validClueIndex(tiny, { x: 0, y: 0, w: 1, h: 2 })).toBe(0);
    expect(validClueIndex(tiny, { x: 0, y: 0, w: 2, h: 2 })).toBe(-1); // 숫자 두 개
    expect(validClueIndex(tiny, { x: 0, y: 0, w: 1, h: 1 })).toBe(-1); // 넓이 다름
  });

  test('2×2는 답이 두 개(가로·세로 모두 가능)라 유일하지 않다', () => {
    expect(solve(tiny, 5).count).toBe(2);
  });
});

describe('생성기', () => {
  test('같은 시드면 같은 퍼즐, 답은 하나뿐', () => {
    const o = { w: 6, h: 6, minArea: 2, maxArea: 8, maxSide: 4 };
    const a = generate(42, o);
    const b = generate(42, o);
    expect(a).not.toBeNull();
    expect(a).toEqual(b);
    expect(solve(a!, 2).count).toBe(1);
    expect(isSolved(a!, a!.solution)).toBe(true);
  });

  test('스테이지 200개: 크기가 챕터 정의와 같고, 정답이 맞고, 답이 하나뿐', () => {
    let n = 0;
    for (const ch of CHAPTERS) {
      for (let lv = 1; lv <= levelCount(ch); lv++) {
        const packed = levels[levelId(ch.id, lv)];
        expect(packed).toBeDefined();
        const p = unpack(packed);
        const o = levelOptions(ch, lv);
        expect([p.w, p.h]).toEqual([o.w, o.h]);
        expect(isSolved(p, p.solution)).toBe(true);
        expect(solve(p, 2).count).toBe(1);
        n++;
      }
    }
    expect(n).toBe(200);
    expect(CHAPTERS.map((c) => c.character)).toEqual(['cat', 'panda', 'rabbit', 'shiba', 'duck']);
  });

  test('챕터 안에서 난이도가 오른다(뒤 10개 평균 갈림길 ≥ 앞 10개)', () => {
    for (const ch of CHAPTERS) {
      const d = Array.from({ length: levelCount(ch) }, (_, i) => levels[levelId(ch.id, i + 1)].d ?? 0);
      const avg = (a: number[]): number => a.reduce((x, y) => x + y, 0) / a.length;
      expect(avg(d.slice(-10))).toBeGreaterThan(avg(d.slice(0, 10)));
      expect(Math.max(...d)).toBeLessThanOrEqual(LEVEL_MAX_BRANCHES);
    }
  });

  test('오늘의 퍼즐은 날짜마다 정해져 있다', () => {
    const a = dailyPuzzle('2026-10-25');
    expect(dailyPuzzle('2026-10-25')).toEqual(a);
    expect(dailyPuzzle('2026-10-26')).not.toEqual(a);
    expect(solve(a, 2).count).toBe(1);
  });
});

describe('한 판 진행', () => {
  test('놓기·겹치면 교체·지우기·되돌리기·완성', () => {
    let g = newGame();
    g = place(g, tiny, { x: 0, y: 0, w: 2, h: 1 });
    g = place(g, tiny, { x: 0, y: 0, w: 1, h: 2 }); // 겹침 → 앞의 것 지움
    expect(g.rects).toEqual([{ x: 0, y: 0, w: 1, h: 2 }]);
    g = place(g, tiny, { x: 1, y: 0, w: 1, h: 2 });
    expect(g.solved).toBe(true);
    // 완성 뒤에는 바뀌지 않는다
    expect(removeAt(g, tiny, 0, 0)).toBe(g);

    let h = newGame();
    h = place(h, tiny, { x: 0, y: 0, w: 1, h: 2 });
    h = removeAt(h, tiny, 0, 1);
    expect(h.rects).toEqual([]);
    h = undo(h);
    expect(h.rects).toHaveLength(1);
    h = clearAll(h, tiny);
    expect(h.rects).toEqual([]);
  });

  test('힌트로 끝까지 풀린다', () => {
    const p = unpack(levels['1-01']);
    let g = newGame();
    for (let i = 0; i < p.clues.length && !g.solved; i++) g = applyHint(g, p);
    expect(g.solved).toBe(true);
    expect(g.hintsUsed).toBeLessThanOrEqual(p.clues.length);
  });
});

describe('진행 기록', () => {
  test('별은 힌트 수로', () => {
    expect([starsFor(0), starsFor(1), starsFor(5)]).toEqual([3, 2, 1]);
  });

  test('스테이지·챕터 잠금', () => {
    let p = { ...INITIAL_PROGRESS };
    expect(isLevelUnlocked(p, 1, 1)).toBe(true);
    expect(isLevelUnlocked(p, 1, 2)).toBe(false);
    expect(isChapterUnlocked(p, 2)).toBe(false);
    let unlocked: number | null = null;
    for (let lv = 1; lv <= CHAPTER_UNLOCK_CLEARS; lv++) {
      const r = recordLevelClear(p, levelId(1, lv), 0, 1000);
      p = r.progress;
      if (r.unlockedChapter) unlocked = r.unlockedChapter;
    }
    expect(unlocked).toBe(2);
    expect(isLevelUnlocked(p, 2, 1)).toBe(true);
    expect(nextUnplayed(p)).toEqual({ chapter: 1, level: CHAPTER_UNLOCK_CLEARS + 1 });
  });

  test('기록은 좋은 쪽을 남긴다', () => {
    let r = recordLevelClear(INITIAL_PROGRESS, '1-01', 2, 5000);
    r = recordLevelClear(r.progress, '1-01', 0, 8000);
    expect(r.progress.levels['1-01']).toEqual({ stars: 3, bestMs: 5000 });
    expect(r.newBest).toBe(false);
  });

  test('오늘의 퍼즐 보상은 하루 한 번, 연속 일수', () => {
    let { progress, reward } = recordDailyClear(INITIAL_PROGRESS, '2026-10-24', 1000);
    expect(reward).toBe(1);
    ({ progress, reward } = recordDailyClear(progress, '2026-10-24', 900));
    expect(reward).toBe(0);
    expect(progress.hints).toBe(START_HINTS + 1);
    ({ progress } = recordDailyClear(progress, '2026-10-25', 900));
    expect(dailyStreak(progress, '2026-10-25', prevDateKey)).toBe(2);
    expect(dailyStreak(progress, '2026-10-26', prevDateKey)).toBe(2); // 오늘은 아직 → 어제까지
    expect(dailyStreak(progress, '2026-10-27', prevDateKey)).toBe(0);
  });

  test('연속 보상은 7일 주기(3일째 +2, 7일째 +5, 8일째 다시 +1), 하루 빠지면 처음부터', () => {
    let p = INITIAL_PROGRESS;
    const got: number[] = [];
    for (let d = 1; d <= 8; d++) {
      const out = recordDailyClear(p, `2026-11-${String(d).padStart(2, '0')}`, 1000);
      p = out.progress;
      got.push(out.reward);
      expect(out.streak).toBe(d);
    }
    expect(got).toEqual([1, 1, 2, 1, 1, 2, 5, 1]);
    expect(streakCycleDay(7)).toBe(7);
    expect(streakCycleDay(8)).toBe(1);
    const gap = recordDailyClear(p, '2026-11-10', 1000);
    expect(gap.streak).toBe(1);
    expect(gap.reward).toBe(streakReward(1));
  });

  test('날짜 키', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(prevDateKey('2026-03-01')).toBe('2026-02-28');
  });

  test('저장값 정리', () => {
    expect(sanitizeProgress(null)).toEqual(INITIAL_PROGRESS);
    expect(sanitizeProgress({ hints: -3, levels: { '1-01': { stars: 9, bestMs: 'x' } } })).toEqual({
      ...INITIAL_PROGRESS,
      levels: { '1-01': { stars: 3, bestMs: 0 } },
    });
  });
});

describe('광고 빈도', () => {
  const base = { adFree: false, lastInterstitialAt: null, now: 1e9 };
  test('처음 몇 번은 없고 N번마다', () => {
    expect(shouldShowInterstitial({ ...base, totalClears: AD_FREE_FIRST_CLEARS })).toBe(false);
    expect(shouldShowInterstitial({ ...base, totalClears: AD_FREE_FIRST_CLEARS + AD_INTERSTITIAL_EVERY })).toBe(true);
    expect(shouldShowInterstitial({ ...base, totalClears: AD_FREE_FIRST_CLEARS + AD_INTERSTITIAL_EVERY, adFree: true })).toBe(false);
    expect(
      shouldShowInterstitial({ ...base, totalClears: AD_FREE_FIRST_CLEARS + AD_INTERSTITIAL_EVERY, lastInterstitialAt: base.now - 1000 }),
    ).toBe(false);
  });
});

describe('광고 제거 제안', () => {
  const base = { adFree: false, canPurchase: true, interstitialsShown: AD_FREE_OFFER_AFTER_INTERSTITIALS, lastOfferDay: null, today: '2026-10-25' };
  test('광고를 몇 번 본 뒤 하루 한 번만', () => {
    expect(shouldOfferAdFree(base)).toBe(true);
    expect(shouldOfferAdFree({ ...base, interstitialsShown: AD_FREE_OFFER_AFTER_INTERSTITIALS - 1 })).toBe(false);
    expect(shouldOfferAdFree({ ...base, lastOfferDay: '2026-10-25' })).toBe(false);
    expect(shouldOfferAdFree({ ...base, lastOfferDay: '2026-10-24' })).toBe(true);
  });
  test('이미 샀거나 결제를 못 쓰면 없음', () => {
    expect(shouldOfferAdFree({ ...base, adFree: true })).toBe(false);
    expect(shouldOfferAdFree({ ...base, canPurchase: false })).toBe(false);
  });
});

describe('문구', () => {
  test('언어 고르기·치환', () => {
    expect(pickLocale(['zh-Hans-CN'])).toBe('zh');
    expect(pickLocale(['fr-FR', 'ja-JP'])).toBe('ja');
    expect(pickLocale(['fr'])).toBe('en');
    expect(translate('ko', 'hintsLeft', { n: 3 })).toBe('힌트 3개');
  });
  test('모든 언어·캐릭터·상황에 대사가 있다', () => {
    for (const l of LOCALES)
      for (const c of ['cat', 'panda', 'rabbit', 'shiba', 'duck'] as const)
        for (const m of ['start', 'good', 'bad', 'hint', 'clear'] as const) expect(characterLine(c, l, m, 7).length).toBeGreaterThan(0);
  });
  test('모든 언어에 모든 문구가 있다', () => {
    expect(Object.keys(translateKeys()).length).toBeGreaterThan(40);
    for (const l of LOCALES.filter((x) => x !== 'ko')) expect(missingKeys(l)).toEqual([]);
  });
  test('튜토리얼 연습 판이 만들어진다', () => {
    expect(generate(7, { w: 4, h: 4, minArea: 2, maxArea: 4, maxSide: 4 })).not.toBeNull();
  });
  test('스테이지 ID', () => {
    expect(levelId(2, 7)).toBe('2-07');
    expect(parseLevelId('2-07')).toEqual({ chapter: 2, level: 7 });
    expect(parseLevelId('daily')).toBeNull();
  });
});
