// 마을 꾸미기(UI 없음): 스테이지를 PROP_EVERY개 깰 때마다 술래잡기 게임 소품을 하나씩 얻는다. 200스테이지 → 20개, 마지막은 집.
// 친구(캐릭터)는 그 캐릭터의 챕터가 열리면 마을에 온다. 배치(좌표)는 화면 쪽(src/ui/villageLayout.ts).
import { CHAPTERS, levelCount, levelId, type CharacterId } from './chapters';
import { PROP_EVERY } from './config';
import { isChapterUnlocked, type Progress } from './progress';

/** 얻는 순서대로. 이미지는 assets/props/<id>.png. */
export const PROP_IDS = [
  'flowers',
  'bunting',
  'bush',
  'signpost',
  'lamp',
  'bench',
  'tree',
  'picnic',
  'stump',
  'fence',
  'cattails',
  'lilypad',
  'rock',
  'barrel',
  'log',
  'bamboo',
  'well',
  'willow',
  'bigtree',
  'house',
] as const;

export type PropId = (typeof PROP_IDS)[number];

/** 깬 스테이지 수(오늘의 퍼즐 제외, 같은 스테이지는 한 번). */
export function stagesCleared(p: Progress): number {
  let n = 0;
  for (const ch of CHAPTERS) for (let lv = 1; lv <= levelCount(ch); lv++) if (p.levels[levelId(ch.id, lv)]) n++;
  return n;
}

export function unlockedPropCount(cleared: number): number {
  return Math.min(PROP_IDS.length, Math.floor(cleared / PROP_EVERY));
}

export function unlockedProps(cleared: number): PropId[] {
  return PROP_IDS.slice(0, unlockedPropCount(cleared));
}

/** 다음 소품과 남은 스테이지 수. 다 모았으면 null. */
export function nextProp(cleared: number): { id: PropId; remaining: number } | null {
  const have = unlockedPropCount(cleared);
  if (have >= PROP_IDS.length) return null;
  return { id: PROP_IDS[have], remaining: (have + 1) * PROP_EVERY - cleared };
}

/** 이번 클리어로 새로 얻은 소품(없으면 null). */
export function newlyUnlockedProp(clearedBefore: number, clearedAfter: number): PropId | null {
  const a = unlockedPropCount(clearedBefore);
  const b = unlockedPropCount(clearedAfter);
  return b > a ? PROP_IDS[b - 1] : null;
}

/** 마을에 와 있는 친구들(챕터가 열린 캐릭터). */
export function villageFriends(p: Progress): CharacterId[] {
  return CHAPTERS.filter((c) => isChapterUnlocked(p, c.id)).map((c) => c.character);
}
