// 진행 기록(UI 없음): 깬 스테이지·별·기록, 힌트 수, 오늘의 퍼즐. 저장은 src/data/progressStore.ts.
import { CHAPTERS, chapterById, levelCount, levelId, type Chapter } from './chapters';
import { CHAPTER_UNLOCK_CLEARS, DAILY_EPOCH, DAILY_STREAK_REWARDS, START_HINTS, STAR_HINT_LIMITS, STREAK_FREEZE_EVERY_DAYS } from './config';
import { prevDateKey } from './daily';

export interface LevelRecord {
  stars: number;
  bestMs: number;
}

export interface Progress {
  levels: Record<string, LevelRecord>;
  /** 오늘의 퍼즐: 날짜 키(YYYY-MM-DD) → 걸린 시간. */
  daily: Record<string, number>;
  /** 지난 오늘의 퍼즐을 나중에 푼 기록: 날짜 키 → 걸린 시간. 연속 일수·보상에는 들어가지 않는다. */
  dailyLate: Record<string, number>;
  hints: number;
  /** 지금까지 깬 횟수(같은 스테이지 반복 포함, 광고 빈도에 쓴다). */
  totalClears: number;
  tutorialDone: boolean;
}

export const INITIAL_PROGRESS: Progress = { levels: {}, daily: {}, dailyLate: {}, hints: START_HINTS, totalClears: 0, tutorialDone: false };

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
  const times = (raw: unknown): Record<string, number> => {
    const out: Record<string, number> = {};
    if (raw && typeof raw === 'object') for (const [k, v] of Object.entries(raw)) out[k] = num(v, 0);
    return out;
  };
  const daily = times(r.daily);
  return {
    levels,
    daily,
    dailyLate: times(r.dailyLate),
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
  /** 어제를 빠졌지만 보호로 이어졌는지. */
  saved: boolean;
}

/** 지난 날의 퍼즐을 나중에 풀었다: 기록만 남긴다(보상·연속 일수 없음). 제날에 푼 날이면 그 기록의 최고 시간만 고친다. */
export function recordLateDailyClear(p: Progress, dateKey: string, ms: number): Progress {
  if (dateKey in p.daily) return { ...p, daily: { ...p.daily, [dateKey]: Math.min(p.daily[dateKey], ms) }, totalClears: p.totalClears + 1 };
  const best = dateKey in p.dailyLate ? Math.min(p.dailyLate[dateKey], ms) : ms;
  return { ...p, dailyLate: { ...p.dailyLate, [dateKey]: best }, totalClears: p.totalClears + 1 };
}

export type DailyStatus = 'onTime' | 'late' | 'open' | 'future' | 'before';

/** 달력 칸 상태: 제날에 풂 / 나중에 풂 / 아직 안 풂(풀 수 있음) / 아직 안 온 날 / 오늘의 퍼즐이 시작되기 전. */
export function dailyStatus(p: Progress, key: string, todayKey: string, epochKey: string = DAILY_EPOCH): DailyStatus {
  if (key < epochKey) return 'before';
  if (key > todayKey) return 'future';
  if (key in p.daily) return 'onTime';
  return key in p.dailyLate ? 'late' : 'open';
}

/** 오늘의 퍼즐 완료. 그날 처음이면 연속 일수에 맞는 힌트 보상. */
export function recordDailyClear(p: Progress, dateKey: string, ms: number): DailyClearOutcome {
  const first = !(dateKey in p.daily);
  const best = first ? ms : Math.min(p.daily[dateKey], ms);
  const daily = { ...p.daily, [dateKey]: best };
  const { streak, savedYesterday: saved } = dailyStreakInfo({ ...p, daily }, dateKey, prevDateKey);
  const reward = first ? streakReward(streak) : 0;
  return {
    progress: { ...p, daily, hints: p.hints + reward, totalClears: p.totalClears + 1 },
    reward,
    streak,
    saved,
  };
}

export interface StreakInfo {
  /** 연속으로 푼 날 수(보호받아 건너뛴 날은 세지 않는다). */
  streak: number;
  /** 어제를 빠졌지만 보호로 이어졌는지(홈·결과 창 안내용). */
  savedYesterday: boolean;
}

/**
 * 오늘의 퍼즐 연속 일수와 보호 여부. 오늘을 아직 안 풀었으면 어제까지를 본다.
 * 하루만 빠진 날은 보호로 건너뛴다. 단 보호 사이에는 STREAK_FREEZE_EVERY_DAYS일 이상 풀어야 한다(이틀 연속 빠지면 끊김).
 * 저장 값 없이 기록(p.daily)만으로 계산한다.
 */
export function dailyStreakInfo(p: Progress, todayKey: string, prevKey: (key: string) => string): StreakInfo {
  const done = (k: string): boolean => k in p.daily;
  let key = done(todayKey) ? todayKey : prevKey(todayKey);
  const yesterday = prevKey(todayKey);
  let streak = 0;
  let savedYesterday = false;
  // 가장 최근 보호 뒤로 푼 날 수(뒤에서부터 세므로, 다음 보호까지의 간격)
  let sinceFreeze = Infinity;
  for (;;) {
    if (done(key)) {
      streak++;
      sinceFreeze++;
      key = prevKey(key);
      continue;
    }
    const before = prevKey(key);
    if (!done(before) || sinceFreeze < STREAK_FREEZE_EVERY_DAYS) break;
    if (key === yesterday) savedYesterday = true;
    sinceFreeze = 0;
    key = before;
  }
  return { streak, savedYesterday };
}

/** 오늘의 퍼즐 연속 일수(오늘 또는 어제까지 이어진 것, 하루 빠진 날은 보호). */
export function dailyStreak(p: Progress, todayKey: string, prevKey: (key: string) => string): number {
  return dailyStreakInfo(p, todayKey, prevKey).streak;
}

export function addHints(p: Progress, n: number): Progress {
  return { ...p, hints: p.hints + n };
}

export function spendHint(p: Progress): Progress | null {
  return p.hints > 0 ? { ...p, hints: p.hints - 1 } : null;
}
