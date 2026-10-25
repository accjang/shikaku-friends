// 스테이지 퍼즐을 미리 만들어 content/levels.json에 쓴다. 실행: npx tsx tools/gen_levels.ts
// 스테이지마다 후보 LEVEL_POOL개를 만들고 풀이기 갈림길 수(난이도)로 줄 세운 뒤,
// 챕터 안 위치에 맞는 순위(LEVEL_DIFFICULTY_RAMP)의 후보를 고른다 → 챕터 안에서 점점 어려워진다.
// 챕터 정의(src/core/chapters.ts)나 생성기를 바꾼 뒤에만 다시 돌린다(출시 뒤에는 기존 스테이지를 바꾸지 말 것).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CHAPTERS, levelCount, levelId, levelOptions } from '../src/core/chapters';
import { LEVEL_DIFFICULTY_RAMP, LEVEL_MAX_BRANCHES, LEVEL_POOL } from '../src/core/config';
import { generate } from '../src/core/generator';
import { pack, type PackedPuzzle } from '../src/core/levelCodec';
import type { Puzzle } from '../src/core/puzzle';
import { hashSeed } from '../src/core/random';
import { solve } from '../src/core/solver';

const out: Record<string, PackedPuzzle> = {};
for (const ch of CHAPTERS) {
  const total = levelCount(ch);
  for (let lv = 1; lv <= total; lv++) {
    const id = levelId(ch.id, lv);
    const pool: { p: Puzzle; d: number }[] = [];
    for (let attempt = 0; pool.length < LEVEL_POOL; attempt++) {
      const p = generate(hashSeed(`${ch.seedPrefix}:${lv}:${attempt}`), levelOptions(ch, lv));
      if (!p) continue;
      const d = solve(p, 2).branches;
      if (d <= LEVEL_MAX_BRANCHES) pool.push({ p, d });
    }
    pool.sort((a, b) => a.d - b.d);
    const t = total > 1 ? (lv - 1) / (total - 1) : 0;
    const rank = LEVEL_DIFFICULTY_RAMP.from + (LEVEL_DIFFICULTY_RAMP.to - LEVEL_DIFFICULTY_RAMP.from) * t;
    const pick = pool[Math.round(rank * (pool.length - 1))];
    out[id] = { ...pack(pick.p), d: pick.d };
    console.log(id, `${pick.p.w}x${pick.p.h}`, `clues=${pick.p.clues.length}`, `branches=${pick.d}`);
  }
}
const file = join(__dirname, '..', 'content', 'levels.json');
writeFileSync(file, JSON.stringify(out) + '\n');
console.log('wrote', file, Object.keys(out).length, 'levels');
