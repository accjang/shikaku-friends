// 해답 탐색기. 생성기가 "답이 하나뿐인지" 확인하는 데 쓴다.
// 숫자마다 가능한 직사각형 후보(넓이 = 숫자, 그 숫자만 포함, 판 안)를 만들고,
// 가장 선택지가 적은 숫자부터 백트래킹한다. limit개를 찾으면 멈춘다.
import { type Puzzle, type Rect } from './puzzle';

/** 숫자 하나의 후보 직사각형들(다른 숫자를 포함하지 않는 것만). */
export function candidatesFor(puzzle: Pick<Puzzle, 'w' | 'h' | 'clues'>, clueIndex: number): Rect[] {
  const { w: W, h: H, clues } = puzzle;
  const c = clues[clueIndex];
  const out: Rect[] = [];
  for (let rw = 1; rw <= c.n; rw++) {
    if (c.n % rw !== 0) continue;
    const rh = c.n / rw;
    if (rw > W || rh > H) continue;
    for (let x = c.x - rw + 1; x <= c.x; x++) {
      if (x < 0 || x + rw > W) continue;
      for (let y = c.y - rh + 1; y <= c.y; y++) {
        if (y < 0 || y + rh > H) continue;
        let clean = true;
        for (let j = 0; j < clues.length && clean; j++) {
          if (j === clueIndex) continue;
          const o = clues[j];
          if (o.x >= x && o.x < x + rw && o.y >= y && o.y < y + rh) clean = false;
        }
        if (clean) out.push({ x, y, w: rw, h: rh });
      }
    }
  }
  return out;
}

export interface SolveResult {
  /** 찾은 해답 수(limit에서 멈춤). */
  count: number;
  /** 첫 해답(clues 순서). 없으면 null. */
  first: Rect[] | null;
}

export function solve(puzzle: Pick<Puzzle, 'w' | 'h' | 'clues'>, limit = 2): SolveResult {
  const { w: W, h: H, clues } = puzzle;
  const total = clues.reduce((s, c) => s + c.n, 0);
  if (total !== W * H) return { count: 0, first: null };

  const grid = new Uint8Array(W * H);
  const cands = clues.map((_, i) => candidatesFor(puzzle, i));
  const chosen: (Rect | null)[] = clues.map(() => null);
  let count = 0;
  let first: Rect[] | null = null;

  const free = (r: Rect): boolean => {
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (grid[y * W + x]) return false;
    return true;
  };
  const fill = (r: Rect, v: 0 | 1): void => {
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) grid[y * W + x] = v;
  };

  const step = (): void => {
    if (count >= limit) return;
    // 남은 숫자 중 놓을 수 있는 후보가 가장 적은 것
    let best = -1;
    let bestOpts: Rect[] = [];
    for (let i = 0; i < clues.length; i++) {
      if (chosen[i]) continue;
      const opts = cands[i].filter(free);
      if (opts.length === 0) return;
      if (best < 0 || opts.length < bestOpts.length) {
        best = i;
        bestOpts = opts;
        if (opts.length === 1) break;
      }
    }
    if (best < 0) {
      count++;
      if (!first) first = chosen.map((r) => ({ ...(r as Rect) }));
      return;
    }
    for (const r of bestOpts) {
      fill(r, 1);
      chosen[best] = r;
      step();
      chosen[best] = null;
      fill(r, 0);
      if (count >= limit) return;
    }
  };

  step();
  return { count, first };
}
