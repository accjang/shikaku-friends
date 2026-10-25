// content/levels.json의 압축 형식 ↔ Puzzle.
// { w, h, c: [[x,y,n],...], s: [[x,y,w,h],...] } — c와 s는 같은 순서.
import type { Puzzle } from './puzzle';

export interface PackedPuzzle {
  w: number;
  h: number;
  c: [number, number, number][];
  s: [number, number, number, number][];
}

export function pack(p: Puzzle): PackedPuzzle {
  return {
    w: p.w,
    h: p.h,
    c: p.clues.map((c) => [c.x, c.y, c.n]),
    s: p.solution.map((r) => [r.x, r.y, r.w, r.h]),
  };
}

export function unpack(p: PackedPuzzle): Puzzle {
  return {
    w: p.w,
    h: p.h,
    clues: p.c.map(([x, y, n]) => ({ x, y, n })),
    solution: p.s.map(([x, y, w, h]) => ({ x, y, w, h })),
  };
}
