// 진행 기록(UI 없음): 깬 스테이지·별·기록, 힌트 수, 오늘의 퍼즐. 저장은 src/data/progressStore.ts.
import { CHAPTERS, chapterById, levelCount, levelId, type Chapter } from './chapters';
import { CHAPTER_UNLOCK_CLEARS, DAILY_STREAK_REWARDS, START_HINTS, STAR_HINT_LIMITS } from './config';
import { prevDateKey } from './daily';

export interface LevelRecord {
  stars: number;
  bestMs: number;
}

export interface Progress {
  levels: Record<string, LevelRecord>;
  /** 오늘의 퍼즐: 날짜 키(YYYY-MM-DD) → 걸린 시간. */
  daily: Record<string, number>;
  hints: number;
  /** 지금까지 깬 횟수(같은 스테이지 반복 포함, 광고 빈도에 쓴다). */
  totalClears: number;
  tutorialDone: boolean;
}

export const INITIAL_PROGRESS: Progress = { levels: {}, daily: {}, hints: START_HINTS, totalClears: 0, tutorialDone: false };

/** 저장소에서 읽은 값을 믿지 않고 모양을 맞춘다. */
export function sanitizeProgress(raw: unknown): Progress {
  if (!raw || typeof raw !== 'object') return { ...INITIAL_PROGRESS };
  const r = raw as Partial<Progress>;
  const num = (v: unknown, d: number): number => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : d);
  const levels: Record<string, LevelRecord> = {};
  if (r.levels && typeof r.levels === 'object') {
    for (const [k, v] of Object.entries(r.levels)) {
      if (v && typeof v === 'object') levels[k] = { stars: Math.min(3, num(v.stars, 1)), bestMs: num(v.bestMs, 0) };
    }
  }
  const daily: Record<string, number> = {};
  if (r.daily && typeof r.daily === 'object') {
    for (const [k, v] of Object.entries(r.daily)) daily[k] = num(v, 0);
  }
  return {
    levels,
    daily,
    hints: num(r.hints, START_HINTS),
    totalClears: num(r.totalClears, 0),
    tutorialDone: r.tutorialDone === true,
  };
}

export function starsFor(hintsUsed: number): number {
  if (hintsUsed <= STAR_HINT_LIMITS.three) return 3;
  if (hintsUsed <= STAR_HINT_LIMITS.two) return 2;
  return 1;
}

export function clearedCount(p: Progress, chapter: Chapter): number {
  let n = 0;
  for (let lv = 1; lv <= levelCount(chapter); lv++) if (p.levels[levelId(chapter.id, lv)]) n++;
  return n;
}

export function starCount(p: Progress, chapter?: Chapter): number {
  const chs = chapter ? [chapter] : CHAPTERS;
  let n = 0;
  for (const ch of chs) for (let lv = 1; lv <= levelCount(ch); lv++) n += p.levels[levelId(ch.id, lv)]?.stars ?? 0;
  return n;
}

export function isChapterUnlocked(p: Progress, chapterId: number): boolean {
  if (chapterId <= 1) return true;
  const prev = chapterById(chapterId - 1);
  return !!prev && clearedCount(p, prev) >= CHAPTER_UNLOCK_CLEARS;
}

/** 스테이지가 열렸는지: 챕터가 열렸고 첫 스테이지이거나 바로 앞을 깼다. */
export function isLevelUnlocked(p: Progress, chapterId: number, level: number): boolean {
  if (!isChapterUnlocked(p, chapterId)) return false;
  return level <= 1 || !!p.levels[levelId(chapterId, level - 1)] || !!p.levels[levelId(chapterId, level)];
}

/** 이어하기: 열린 스테이지 중 아직 안 깬 첫 스테이지(챕터 순). 전부 깼으면 null. */
export function nextUnplayed(p: Progress): { chapter: number; level: number } | null {
  for (const ch of CHAPTERS) {
    if (!isChapterUnlocked(p, ch.id)) continue;
    for (let lv = 1; lv <= levelCount(ch); lv++) {
      if (!p.levels[levelId(ch.id, lv)] && isLevelUnlocked(p, ch.id, lv)) return { chapter: ch.id, level: lv };
    }
  }
  return null;
}

export interface ClearOutcome {
  progress: Progress;
  stars: number;
  newBest: boolean;
  /** 이번에 처음 열린 챕터(없으면 null). */
  unlockedChapter: number | null;
}

export function recordLevelClear(p: Progress, id: string, hintsUsed: number, ms: number): ClearOutcome {
  const stars = starsFor(hintsUsed);
  const prev = p.levels[id];
  const before = CHAPTERS.filter((c) => isChapterUnlocked(p, c.id)).map((c) => c.id);
  const rec: LevelRecord = {
    stars: Math.max(stars, prev?.stars ?? 0),
    bestMs: prev && prev.bestMs > 0 ? Math.min(prev.bestMs, ms) : ms,
  };
  const progress: Progress = { ...p, levels: { ...p.levels, [id]: rec }, totalClears: p.totalClears + 1 };
  const after = CHAPTERS.filter((c) => isChapterUnlocked(progress, c.id)).map((c) => c.id);
  const unlockedChapter = after.find((c) => !before.includes(c)) ?? null;
  return { progress, stars, newBest: !prev || ms < prev.bestMs, unlockedChapter };
}

/** 오늘의 퍼즐 완료. 그날 처음이면 힌트 보상. */
/** 연속 n일째(1부터)에 받는 힌트(7일 주기). */
export function streakReward(streakDay: number): number {
  const i = (Math.max(1, streakDay) - 1) % DAILY_STREAK_REWARDS.length;
  return DAILY_STREAK_REWARDS[i];
}

/** 7일 주기 안에서 몇 번째 날인지(1~7). */
export function streakCycleDay(streakDay: number): number {
  return ((Math.max(1, streakDay) - 1) % DAILY_STREAK_REWARDS.length) + 1;
}

export interface DailyClearOutcome {
  progress: Progress;
  /** 그날 처음 깼으면 받은 힌트 수, 아니면 0. */
  reward: number;
  /** 오늘을 포함한 연속 일수. */
  streak: number;
}

/** 오늘의 퍼즐 완료. 그날 처음이면 연속 일수에 맞는 힌트 보상. */
export function recordDailyClear(p: Progress, dateKey: string, ms: number): DailyClearOutcome {
  const first = !(dateKey in p.daily);
  const best = first ? ms : Math.min(p.daily[dateKey], ms);
  const daily = { ...p.daily, [dateKey]: best };
  const streak = dailyStreak({ ...p, daily }, dateKey, prevDateKey);
  const reward = first ? streakReward(streak) : 0;
  return {
    progress: { ...p, daily, hints: p.hints + reward, totalClears: p.totalClears + 1 },
    reward,
    streak,
  };
}

/** 오늘의 퍼즐 연속 일수(오늘 또는 어제까지 이어진 것). */
export function dailyStreak(p: Progress, todayKey: string, prevKey: (key: string) => string): number {
  let key = todayKey in p.daily ? todayKey : prevKey(todayKey);
  let n = 0;
  while (key in p.daily) {
    n++;
    key = prevKey(key);
  }
  return n;
}

export function addHints(p: Progress, n: number): Progress {
  return { ...p, hints: p.hints + n };
}

export function spendHint(p: Progress): Progress | null {
  return p.hints > 0 ? { ...p, hints: p.hints - 1 } : null;
}
