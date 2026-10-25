// 캐릭터 움직임 프레임을 렌더한다(tools/char_anims.json). 실행: NODE_PATH=$(npm root -g) npm run render:anims
// 결과: tools/out_anims/<캐릭터>_<동작>_<번호>.png → python3 tools/crop_anims.py 로 assets/anims/에 넣고 src/ui/sprites.ts를 만든다.
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary' };
const server = createServer((req, res) => {
  try {
    const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const body = readFileSync(path);
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);

const ANIMS = JSON.parse(readFileSync(join(root, 'tools', 'char_anims.json'), 'utf8'));
const YAW = 0.25;
const out = join(root, 'tools', 'out_anims');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/tools/render_chars.html`);
await page.waitForFunction('window.ready');
for (const [name, anims] of Object.entries(ANIMS)) {
  if (name.startsWith('_')) continue;
  for (const [anim, a] of Object.entries(anims)) {
    const ts = Array.from({ length: a.frames }, (_, i) => a.from + ((a.to - a.from) * i) / (a.frames - 1));
    const urls = await page.evaluate(([m, t, y]) => window.renderSeq(m, t, y), [a.model, ts, YAW]);
    urls.forEach((u, i) => writeFileSync(join(out, `${name}_${anim}_${String(i).padStart(2, '0')}.png`), Buffer.from(u.split(',')[1], 'base64')));
    console.log(name, anim, urls.length);
  }
}
await browser.close();
server.close();
