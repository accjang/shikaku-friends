/// <reference types="node" />
// 언어 파일 하나 검사: npx tsx tools/check_locale.ts <코드>  (예: th, zh-Hant)
// 빠진 키·빈 문구·자리표시자({n} 등) 불일치·대사 비었음·이름 빠짐·스토어 글자 수를 찾는다. 문제가 있으면 종료 코드 1.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { KO_UI, ko } from '../src/core/locales/ko';

const code = process.argv[2];
if (!code) throw new Error('언어 코드를 주세요');
const exportName = code === 'zh-Hant' ? 'zhHant' : code;
const root = join(__dirname, '..');

async function main(): Promise<void> {
  const mod = (await import(`../src/core/locales/${code}`)) as Record<string, typeof ko>;
  const b = mod[exportName];
  const errors: string[] = [];
  if (!b) throw new Error(`export const ${exportName} 가 없어요`);
  const holes = (s: string): string => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  for (const k of Object.keys(KO_UI) as (keyof typeof KO_UI)[]) {
    const v = b.ui[k];
    if (!v || !v.trim()) errors.push(`ui.${k} 비었음`);
    else if (holes(v) !== holes(KO_UI[k])) errors.push(`ui.${k} 자리표시자 다름: "${v}" (기준 "${KO_UI[k]}")`);
  }
  for (const k of Object.keys(b.ui)) if (!(k in KO_UI)) errors.push(`ui.${k} 기준에 없는 키`);
  for (const ch of Object.keys(ko.names) as (keyof typeof ko.names)[]) {
    if (!b.names[ch]) errors.push(`names.${ch} 비었음`);
    for (const mood of Object.keys(ko.lines.cat) as (keyof typeof ko.lines.cat)[]) {
      const arr = b.lines[ch]?.[mood];
      if (!arr || arr.length === 0 || arr.some((x) => !x.trim())) errors.push(`lines.${ch}.${mood} 비었음`);
    }
  }
  for (const p of Object.keys(ko.props) as (keyof typeof ko.props)[]) if (!b.props[p]) errors.push(`props.${p} 비었음`);
  if (!b.name) errors.push('name 비었음');

  const plist = join(root, 'content', 'infoplist', `${code}.json`);
  if (!existsSync(plist)) errors.push(`content/infoplist/${code}.json 없음`);
  else {
    const j = JSON.parse(readFileSync(plist, 'utf8')) as Record<string, string>;
    for (const k of ['CFBundleDisplayName', 'NSUserTrackingUsageDescription']) if (!j[k]) errors.push(`infoplist ${k} 없음`);
  }
  const listing = join(root, 'docs', 'store', 'listing', `${code}.md`);
  if (!existsSync(listing)) errors.push(`docs/store/listing/${code}.md 없음`);
  else {
    const t = readFileSync(listing, 'utf8');
    const field = (name: string): string | null => new RegExp(`^- ${name}: (.*)$`, 'm').exec(t)?.[1]?.trim() ?? null;
    const limits: [string, number][] = [['title', 30], ['subtitle', 30], ['short', 80], ['keywords', 100]];
    for (const [name, max] of limits) {
      const v = field(name);
      if (!v) errors.push(`listing ${name} 없음`);
      else if ([...v].length > max) errors.push(`listing ${name} ${[...v].length}자 > ${max}자`);
    }
    // 스크린샷 문구(tools/gen_store_art.ts): 장면 5개, 한 줄~두 줄에 들어가게
    const shots = field('shots')?.split('|').map((s) => s.trim()) ?? [];
    if (shots.length !== 5 || shots.some((s) => !s)) errors.push(`listing shots 문구 ${shots.length}개(5개여야 함)`);
    for (const s of shots) if ([...s].length > 40) errors.push(`listing shots "${s}" ${[...s].length}자 > 40자`);
  }
  if (errors.length) {
    console.error(`${code}: 문제 ${errors.length}개\n` + errors.map((e) => ' - ' + e).join('\n'));
    process.exit(1);
  }
  console.log(`${code}: OK`);
}
void main();
