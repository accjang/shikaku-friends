// 퍼즐 생성기. 시드가 같으면 같은 퍼즐(기기·버전 무관하게 같게 하려고 스테이지는 미리 만들어 content/levels.json에 둔다).
// 1) 판을 직사각형으로 무작위 분할 → 2) 직사각형마다 숫자 칸을 무작위로 고름 → 3) 답이 하나뿐일 때까지 숫자 위치를 바꿔 본다.
import { GEN_CLUE_RETRIES, GEN_PARTITION_RETRIES } from './config';
import { type Clue, type Puzzle, type Rect } from './puzzle';
import { mulberry32, randInt, type Rng } from './random';
import { solve } from './solver';

export interface GenOptions {
  w: number;
  h: number;
  /** 직사각형 넓이 범위. 클수록 숫자가 적고 어렵다. */
  minArea: number;
  maxArea: number;
  /** 한 변 최대 길이(가늘고 긴 막대를 줄인다). */
  maxSide: number;
}

/** 판을 직사각형으로 나눈다. 왼쪽 위부터 빈 칸을 찾아 그 칸에서 시작하는 직사각형을 고른다. */
export function partition(rng: Rng, o: GenOptions): Rect[] | null {
  const { w: W, h: H } = o;
  const used = new Uint8Array(W * H);
  const rects: Rect[] = [];
  const fits = (x: number, y: number, rw: number, rh: number): boolean => {
    if (x + rw > W || y + rh > H) return false;
    for (let yy = y; yy < y + rh; yy++) for (let xx = x; xx < x + rw; xx++) if (used[yy * W + xx]) return false;
    return true;
  };
  for (let i = 0; i < W * H; i++) {
    if (used[i]) continue;
    const x = i % W;
    const y = Math.floor(i / W);
    const options: { rw: number; rh: number }[] = [];
    for (let rw = 1; rw <= o.maxSide; rw++) {
      for (let rh = 1; rh <= o.maxSide; rh++) {
        const a = rw * rh;
        if (a < o.minArea || a > o.maxArea) continue;
        if (fits(x, y, rw, rh)) options.push({ rw, rh });
      }
    }
    let pick: { rw: number; rh: number };
    if (options.length > 0) {
      pick = options[Math.floor(rng() * options.length)];
    } else {
      // 남은 틈: 들어가는 가장 큰 직사각형(넓이 하한 무시)
      let best = { rw: 1, rh: 1 };
      for (let rw = 1; rw <= o.maxSide; rw++)
        for (let rh = 1; rh <= o.maxSide; rh++)
          if (rw * rh <= o.maxArea && fits(x, y, rw, rh) && rw * rh > best.rw * best.rh) best = { rw, rh };
      pick = best;
    }
    const r = { x, y, w: pick.rw, h: pick.rh };
    for (let yy = r.y; yy < r.y + r.h; yy++) for (let xx = r.x; xx < r.x + r.w; xx++) used[yy * W + xx] = 1;
    rects.push(r);
  }
  // 1칸짜리가 너무 많으면 버린다(너무 쉬움)
  const singles = rects.filter((r) => r.w * r.h === 1).length;
  if (singles > Math.max(1, Math.floor(rects.length / 8))) return null;
  return rects;
}

function placeClues(rng: Rng, rects: Rect[]): Clue[] {
  return rects.map((r) => ({ x: r.x + randInt(rng, 0, r.w - 1), y: r.y + randInt(rng, 0, r.h - 1), n: r.w * r.h }));
}

/** 답이 하나뿐인 퍼즐을 만든다. 실패하면 null(옵션이 너무 빡빡할 때). */
export function generate(seed: number, o: GenOptions): Puzzle | null {
  const rng = mulberry32(seed);
  for (let p = 0; p < GEN_PARTITION_RETRIES; p++) {
    const rects = partition(rng, o);
    if (!rects) continue;
    for (let c = 0; c < GEN_CLUE_RETRIES; c++) {
      const clues = placeClues(rng, rects);
      const { count } = solve({ w: o.w, h: o.h, clues }, 2);
      if (count === 1) return sortPuzzle({ w: o.w, h: o.h, clues, solution: rects });
    }
  }
  return null;
}

/** 숫자를 읽기 순서(위→아래, 왼→오)로 정렬(정답도 같이). */
function sortPuzzle(p: Puzzle): Puzzle {
  const order = p.clues.map((_, i) => i).sort((a, b) => p.clues[a].y - p.clues[b].y || p.clues[a].x - p.clues[b].x);
  return { ...p, clues: order.map((i) => p.clues[i]), solution: order.map((i) => p.solution[i]) };
}
