// 한 판의 진행 상태(UI 없음). 화면은 이 함수들로 새 상태를 만들어 쓴다.
import { UNDO_LIMIT } from './config';
import { isSolved, placeRect, rectAt, sameRect, type Puzzle, type Rect } from './puzzle';

export interface GameState {
  rects: Rect[];
  /** 되돌리기용 이전 rects들. */
  history: Rect[][];
  hintsUsed: number;
  solved: boolean;
}

export function newGame(): GameState {
  return { rects: [], history: [], hintsUsed: 0, solved: false };
}

function push(state: GameState, puzzle: Puzzle, rects: Rect[], extra: Partial<GameState> = {}): GameState {
  const history = [...state.history, state.rects].slice(-UNDO_LIMIT);
  return { ...state, ...extra, rects, history, solved: isSolved(puzzle, rects) };
}

/** 직사각형을 놓는다(겹치는 것은 지운다). 이미 같은 것이 있으면 그대로. */
export function place(state: GameState, puzzle: Puzzle, r: Rect): GameState {
  if (state.solved) return state;
  if (state.rects.some((o) => sameRect(o, r))) return state;
  return push(state, puzzle, placeRect(state.rects, r));
}

/** (x,y) 칸의 직사각형을 지운다. 없으면 그대로. */
export function removeAt(state: GameState, puzzle: Puzzle, x: number, y: number): GameState {
  if (state.solved) return state;
  const i = rectAt(state.rects, x, y);
  if (i < 0) return state;
  return push(state, puzzle, state.rects.filter((_, j) => j !== i));
}

export function undo(state: GameState): GameState {
  if (state.solved || state.history.length === 0) return state;
  const rects = state.history[state.history.length - 1];
  return { ...state, rects, history: state.history.slice(0, -1) };
}

export function clearAll(state: GameState, puzzle: Puzzle): GameState {
  if (state.solved || state.rects.length === 0) return state;
  return push(state, puzzle, []);
}

/** 힌트로 놓을 정답 직사각형: 아직 정확히 놓이지 않은 것 중 사용자가 놓은 것과 가장 덜 겹치는 것. 없으면 null. */
export function nextHint(state: GameState, puzzle: Puzzle): Rect | null {
  const missing = puzzle.solution.filter((s) => !state.rects.some((r) => sameRect(r, s)));
  if (missing.length === 0) return null;
  // 작은 것부터(초반에 판을 여는 데 도움이 되는 순서): 넓이가 작고 위쪽에 있는 것
  const sorted = [...missing].sort((a, b) => a.w * a.h - b.w * b.h || a.y - b.y || a.x - b.x);
  return sorted[0];
}

export function applyHint(state: GameState, puzzle: Puzzle): GameState {
  const hint = nextHint(state, puzzle);
  if (!hint || state.solved) return state;
  return push(state, puzzle, placeRect(state.rects, hint), { hintsUsed: state.hintsUsed + 1 });
}
