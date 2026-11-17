// 그림 앨범(UI 없음): 챕터마다 그림 PICTURES_PER_CHAPTER장. 스테이지를 깨면 그 스테이지 구간의 그림이 판에 드러나고 앨범에 모인다.
// 그림 파일은 tools/gen_postcards.py가 만든다(assets/postcards/<캐릭터>_<번호>.png, 화면 쪽 연결은 src/ui/postcards.ts).
import { CHAPTERS, chapterById, levelCount, levelId, type CharacterId } from './chapters';
import { PICTURES_PER_CHAPTER } from './config';
import type { Progress } from './progress';

export interface PictureId {
  character: CharacterId;
  /** 1 ~ PICTURES_PER_CHAPTER. */
  n: number;
}

export const pictureKey = (p: PictureId): string => `${p.character}_${p.n}`;

/** 앨범 순서(챕터 순, 번호 순). */
export const ALL_PICTURES: readonly PictureId[] = CHAPTERS.flatMap((c) =>
  Array.from({ length: PICTURES_PER_CHAPTER }, (_, i) => ({ character: c.character, n: i + 1 })),
);

/** 그 스테이지를 깨면 드러나는 그림: 챕터를 PICTURES_PER_CHAPTER 구간으로 고르게 나눈다(60스테이지면 15개마다). */
export function pictureForLevel(chapterId: number, level: number): PictureId | null {
  const ch = chapterById(chapterId);
  if (!ch) return null;
  const count = levelCount(ch);
  const n = Math.min(PICTURES_PER_CHAPTER, Math.floor(((Math.max(1, level) - 1) * PICTURES_PER_CHAPTER) / count) + 1);
  return { character: ch.character, n };
}

/** 오늘의 퍼즐 그림: 날짜마다 앨범 전체를 차례로 돈다(앨범에 모이지는 않는다). */
export function pictureForDay(dateKey: string): PictureId {
  const [y, m, d] = dateKey.split('-').map(Number);
  const days = Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
  return ALL_PICTURES[((days % ALL_PICTURES.length) + ALL_PICTURES.length) % ALL_PICTURES.length];
}

/** 모은 그림 키들: 그 구간의 스테이지를 하나라도 깼으면 모은 것. */
export function collectedPictures(p: Progress): Set<string> {
  const out = new Set<string>();
  for (const ch of CHAPTERS) {
    for (let lv = 1; lv <= levelCount(ch); lv++) {
      if (!p.levels[levelId(ch.id, lv)]) continue;
      const pic = pictureForLevel(ch.id, lv);
      if (pic) out.add(pictureKey(pic));
    }
  }
  return out;
}

/** 이번 클리어로 새로 모은 그림(없으면 null). */
export function newlyCollectedPicture(before: Progress, after: Progress): PictureId | null {
  const had = collectedPictures(before);
  const now = collectedPictures(after);
  return ALL_PICTURES.find((pic) => now.has(pictureKey(pic)) && !had.has(pictureKey(pic))) ?? null;
}
