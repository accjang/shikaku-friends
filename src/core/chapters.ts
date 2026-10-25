// 챕터(캐릭터별 세계)와 스테이지 난이도 구간. 스테이지 퍼즐 자체는 tools/gen_levels.ts가 content/levels.json으로 만든다.
import type { GenOptions } from './generator';

export type CharacterId = 'cat' | 'panda' | 'rabbit' | 'shiba' | 'duck';

export interface LevelBand {
  /** 이 구간의 스테이지 수. */
  count: number;
  options: GenOptions;
}

export interface Chapter {
  id: number;
  character: CharacterId;
  /** 생성 시드 접두어(바꾸면 스테이지가 전부 바뀐다). */
  seedPrefix: string;
  bands: LevelBand[];
}

// 5챕터 × 40 = 200스테이지. 챕터 안에서는 판 크기와 함께 난이도(풀이기 갈림길 수)도 점점 오른다(tools/gen_levels.ts).
export const CHAPTERS: readonly Chapter[] = [
  {
    id: 1,
    character: 'cat',
    seedPrefix: 'cat-v2',
    bands: [
      { count: 6, options: { w: 5, h: 5, minArea: 2, maxArea: 6, maxSide: 4 } },
      { count: 12, options: { w: 6, h: 6, minArea: 2, maxArea: 8, maxSide: 4 } },
      { count: 12, options: { w: 7, h: 7, minArea: 2, maxArea: 9, maxSide: 5 } },
      { count: 10, options: { w: 7, h: 8, minArea: 2, maxArea: 10, maxSide: 5 } },
    ],
  },
  {
    id: 2,
    character: 'panda',
    seedPrefix: 'panda-v2',
    bands: [
      { count: 14, options: { w: 8, h: 8, minArea: 2, maxArea: 10, maxSide: 5 } },
      { count: 13, options: { w: 8, h: 9, minArea: 2, maxArea: 12, maxSide: 6 } },
      { count: 13, options: { w: 9, h: 9, minArea: 2, maxArea: 12, maxSide: 6 } },
    ],
  },
  {
    id: 3,
    character: 'rabbit',
    seedPrefix: 'rabbit-v2',
    bands: [
      { count: 14, options: { w: 9, h: 10, minArea: 3, maxArea: 12, maxSide: 6 } },
      { count: 13, options: { w: 10, h: 10, minArea: 3, maxArea: 12, maxSide: 6 } },
      { count: 13, options: { w: 10, h: 11, minArea: 3, maxArea: 14, maxSide: 6 } },
    ],
  },
  {
    id: 4,
    character: 'shiba',
    seedPrefix: 'shiba-v1',
    bands: [
      { count: 13, options: { w: 10, h: 11, minArea: 3, maxArea: 16, maxSide: 7 } },
      { count: 14, options: { w: 10, h: 12, minArea: 3, maxArea: 16, maxSide: 7 } },
      { count: 13, options: { w: 10, h: 12, minArea: 4, maxArea: 18, maxSide: 7 } },
    ],
  },
  {
    id: 5,
    character: 'duck',
    seedPrefix: 'duck-v1',
    bands: [
      { count: 13, options: { w: 10, h: 12, minArea: 4, maxArea: 20, maxSide: 8 } },
      { count: 14, options: { w: 10, h: 13, minArea: 4, maxArea: 20, maxSide: 8 } },
      { count: 13, options: { w: 10, h: 14, minArea: 4, maxArea: 24, maxSide: 8 } },
    ],
  },
];

export function chapterById(id: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function levelCount(chapter: Chapter): number {
  return chapter.bands.reduce((s, b) => s + b.count, 0);
}

/** 챕터 안 스테이지 번호(1부터)의 생성 옵션. */
export function levelOptions(chapter: Chapter, level: number): GenOptions {
  let n = level;
  for (const b of chapter.bands) {
    if (n <= b.count) return b.options;
    n -= b.count;
  }
  return chapter.bands[chapter.bands.length - 1].options;
}

/** 스테이지 ID("1-07"). 저장·주소에 쓴다. */
export function levelId(chapterId: number, level: number): string {
  return `${chapterId}-${String(level).padStart(2, '0')}`;
}

export function parseLevelId(id: string): { chapter: number; level: number } | null {
  const m = /^(\d+)-(\d+)$/.exec(id);
  if (!m) return null;
  return { chapter: Number(m[1]), level: Number(m[2]) };
}
