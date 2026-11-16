// 한 판의 진행 상태(UI 없음). 화면은 이 함수들로 새 상태를 만들어 쓴다.
// 실수: 숫자 하나에 크기까지 맞는데 정답 자리가 아닌 네모(답이 하나뿐이라 확실히 틀림). 놓지 않고 하트만 깎는다.
// 크기가 틀렸거나 숫자가 없는·여러 개인 회색 네모는 잘못 누른 것으로 보고 봐준다(지우면 그만).
import { CONTINUE_HEARTS, MISTAKE_ALLOWANCE, UNDO_LIMIT } from './config';
import { isSolved, overlaps, placeRect, rectAt, sameRect, validClueIndex, type Puzzle, type Rect } from './puzzle';
import { candidatesFor } from './solver';

export interface GameState {
  rects: Rect[];
  /** 되돌리기용 이전 rects들. */
  history: Rect[][];
  hintsUsed: number;
  solved: boolean;
  /** 이 판에서 한 실수 수. */
  mistakes: number;
  /** 실수가 MISTAKE_ALLOWANCE를 넘어 이 판은 끝(다시 하기나 이어하기). */
  failed: boolean;
}

export function newGame(): GameState {
  return { rects: [], history: [], hintsUsed: 0, solved: false, mistakes: 0, failed: false };
}

/** 남은 하트(0 이상). */
export function heartsLeft(state: GameState, allowance = MISTAKE_ALLOWANCE): number {
  return Math.max(0, allowance - state.mistakes);
}

/** 숫자 하나·크기는 맞지만 정답 자리가 아닌 네모인지. */
export function isMistake(puzzle: Puzzle, r: Rect): boolean {
  const ci = validClueIndex(puzzle, r);
  return ci >= 0 && !sameRect(r, puzzle.solution[ci]);
}

/**
 * 실수를 세며 놓는다(게임 화면용, 튜토리얼은 place). 실수면 놓지 않고 mistakes+1, 봐주는 수를 넘으면 failed.
 * mistake는 이번 시도가 실수였는지(화면이 틀린 네모를 잠깐 보여 준다).
 */
export function attemptPlace(state: GameState, puzzle: Puzzle, r: Rect, allowance = MISTAKE_ALLOWANCE): { state: GameState; mistake: boolean } {
  if (state.solved || state.failed) return { state, mistake: false };
  if (!isMistake(puzzle, r)) return { state: place(state, puzzle, r), mistake: false };
  const mistakes = state.mistakes + 1;
  return { state: { ...state, mistakes, failed: mistakes > allowance }, mistake: true };
}

/** 실패한 판을 이어한다(보상형 광고): 하트 CONTINUE_HEARTS개를 돌려준다. 놓은 네모는 그대로. */
export function continueGame(state: GameState, allowance = MISTAKE_ALLOWANCE): GameState {
  if (!state.failed) return state;
  return { ...state, failed: false, mistakes: Math.max(0, allowance - CONTINUE_HEARTS) };
}

function push(state: GameState, puzzle: Puzzle, rects: Rect[], extra: Partial<GameState> = {}): GameState {
  const history = [...state.history, state.rects].slice(-UNDO_LIMIT);
  return { ...state, ...extra, rects, history, solved: isSolved(puzzle, rects) };
}

/** 직사각형을 놓는다(겹치는 것은 지운다). 이미 같은 것이 있으면 그대로. */
export function place(state: GameState, puzzle: Puzzle, r: Rect): GameState {
  if (state.solved || state.failed) return state;
  if (state.rects.some((o) => sameRect(o, r))) return state;
  return push(state, puzzle, placeRect(state.rects, r));
}

/** (x,y) 칸의 직사각형을 지운다. 없으면 그대로. */
export function removeAt(state: GameState, puzzle: Puzzle, x: number, y: number): GameState {
  if (state.solved || state.failed) return state;
  const i = rectAt(state.rects, x, y);
  if (i < 0) return state;
  return push(state, puzzle, state.rects.filter((_, j) => j !== i));
}

export function undo(state: GameState): GameState {
  if (state.solved || state.failed || state.history.length === 0) return state;
  const rects = state.history[state.history.length - 1];
  return { ...state, rects, history: state.history.slice(0, -1) };
}

export function clearAll(state: GameState, puzzle: Puzzle): GameState {
  if (state.solved || state.failed || state.rects.length === 0) return state;
  return push(state, puzzle, []);
}

/** 힌트가 왜 그 네모인지: onlyFit = 그 숫자가 들어갈 자리가 하나뿐(n = 숫자), try = 이유를 한 줄로 말하기 어려워 그냥 권함. */
export type HintReason = { kind: 'onlyFit'; n: number } | { kind: 'try' };

export interface Hint {
  rect: Rect;
  reason: HintReason;
}

/**
 * 힌트: 아직 정확히 놓이지 않은 정답 네모 하나와 그 이유.
 * 이미 맞게 놓인 네모를 피하면 후보가 하나뿐인 숫자가 있으면 그것을(이유 onlyFit) — 사람이 따라 배울 수 있는 수.
 * 없으면 작은 것부터(초반에 판을 여는 데 도움이 되는 순서) 권한다(이유 try). 숫자 1은 나머지가 다 놓인 뒤에만. 다 놓였으면 null.
 */
export function explainHint(state: GameState, puzzle: Puzzle): Hint | null {
  const placed = (s: Rect): boolean => state.rects.some((r) => sameRect(r, s));
  const missing = puzzle.solution.map((s, i) => ({ s, i })).filter(({ s }) => !placed(s));
  if (missing.length === 0) return null;
  // 넓이가 작고 위쪽에 있는 것부터. 한 칸짜리(숫자 1)는 누구나 아는 수라 힌트가 아까우니 맨 뒤로 — 다른 것이 다 놓인 뒤에만 준다
  missing.sort((a, b) => a.s.w * a.s.h - b.s.w * b.s.h || a.s.y - b.s.y || a.s.x - b.s.x);
  const big = missing.filter(({ i }) => puzzle.clues[i].n > 1);
  if (big.length === 0) return { rect: missing[0].s, reason: { kind: 'onlyFit', n: 1 } };
  const correct = puzzle.solution.filter(placed);
  for (const { s, i } of big) {
    const open = candidatesFor(puzzle, i).filter((c) => !correct.some((r) => overlaps(r, c)));
    if (open.length === 1) return { rect: s, reason: { kind: 'onlyFit', n: puzzle.clues[i].n } };
  }
  return { rect: big[0].s, reason: { kind: 'try' } };
}

/** 힌트로 놓을 정답 직사각형(explainHint의 네모). 없으면 null. */
export function nextHint(state: GameState, puzzle: Puzzle): Rect | null {
  return explainHint(state, puzzle)?.rect ?? null;
}

export function applyHint(state: GameState, puzzle: Puzzle): GameState {
  const hint = nextHint(state, puzzle);
  if (!hint || state.solved || state.failed) return state;
  return push(state, puzzle, placeRect(state.rects, hint), { hintsUsed: state.hintsUsed + 1 });
}
