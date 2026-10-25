// 스테이지 퍼즐을 미리 만들어 content/levels.json에 쓴다. 실행: npx tsx tools/gen_levels.ts
// 챕터 정의(src/core/chapters.ts)나 생성기를 바꾼 뒤에만 다시 돌린다(이미 출시한 스테이지가 바뀌므로 주의).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CHAPTERS, levelCount, levelId, levelOptions } from '../src/core/chapters';
import { generate } from '../src/core/generator';
import { pack, type PackedPuzzle } from '../src/core/levelCodec';
import { hashSeed } from '../src/core/random';

const out: Record<string, PackedPuzzle> = {};
for (const ch of CHAPTERS) {
  for (let lv = 1; lv <= levelCount(ch); lv++) {
    const id = levelId(ch.id, lv);
    const t = Date.now();
    let puzzle = null;
    for (let attempt = 0; !puzzle; attempt++) {
      puzzle = generate(hashSeed(`${ch.seedPrefix}:${lv}:${attempt}`), levelOptions(ch, lv));
    }
    out[id] = pack(puzzle);
    console.log(id, `${puzzle.w}x${puzzle.h}`, `clues=${puzzle.clues.length}`, `${Date.now() - t}ms`);
  }
}
const file = join(__dirname, '..', 'content', 'levels.json');
writeFileSync(file, JSON.stringify(out) + '\n');
console.log('wrote', file, Object.keys(out).length, 'levels');
