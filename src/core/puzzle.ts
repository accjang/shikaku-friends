// 시카쿠 규칙(UI 없음). 판은 w×h 칸, 숫자(clue)가 적힌 칸들이 있고
// 판 전체를 직사각형으로 나누되 각 직사각형에는 숫자가 정확히 하나, 그 숫자 = 직사각형 넓이여야 한다.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Clue {
  x: number;
  y: number;
  n: number;
}

export interface Puzzle {
  w: number;
  h: number;
  clues: Clue[];
  /** 정답(유일해). 힌트에 쓴다. clues와 같은 순서. */
  solution: Rect[];
}

export function area(r: Rect): number {
  return r.w * r.h;
}

export function contains(r: Rect, x: number, y: number): boolean {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function sameRect(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

/** 두 칸을 꼭짓점으로 하는 직사각형(드래그 시작·끝). */
export function rectFromCorners(x1: number, y1: number, x2: number, y2: number): Rect {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  return { x, y, w: Math.abs(x2 - x1) + 1, h: Math.abs(y2 - y1) + 1 };
}

/** 직사각형 안의 숫자들(인덱스). */
export function cluesIn(puzzle: Pick<Puzzle, 'clues'>, r: Rect): number[] {
  const out: number[] = [];
  puzzle.clues.forEach((c, i) => {
    if (contains(r, c.x, c.y)) out.push(i);
  });
  return out;
}

/** 직사각형이 규칙에 맞는지: 숫자가 정확히 하나이고 넓이가 그 숫자. 맞으면 그 숫자 인덱스, 아니면 -1. */
export function validClueIndex(puzzle: Pick<Puzzle, 'clues'>, r: Rect): number {
  const inside = cluesIn(puzzle, r);
  if (inside.length !== 1) return -1;
  return puzzle.clues[inside[0]].n === area(r) ? inside[0] : -1;
}

/** 놓인 직사각형들로 판이 완성됐는지: 모든 칸이 덮였고 모든 직사각형이 맞다(겹침은 놓을 때 막는다). */
export function isSolved(puzzle: Puzzle, rects: readonly Rect[]): boolean {
  let covered = 0;
  for (const r of rects) {
    if (validClueIndex(puzzle, r) < 0) return false;
    covered += area(r);
  }
  return covered === puzzle.w * puzzle.h;
}

/** 새 직사각형을 놓는다: 겹치는 기존 직사각형은 빼고 새 것을 더한다. */
export function placeRect(rects: readonly Rect[], r: Rect): Rect[] {
  return [...rects.filter((o) => !overlaps(o, r)), r];
}

/** (x,y) 칸을 덮는 직사각형 인덱스(없으면 -1). */
export function rectAt(rects: readonly Rect[], x: number, y: number): number {
  return rects.findIndex((r) => contains(r, x, y));
}

/** 덮인 칸 비율(0~1, 진행 표시). */
export function coverage(puzzle: Puzzle, rects: readonly Rect[]): number {
  const total = puzzle.w * puzzle.h;
  return rects.reduce((s, r) => s + area(r), 0) / total;
}
