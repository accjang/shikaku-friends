// 마을 꾸미기 소품(assets/source/props/*.glb — 술래잡기 게임 소품, Higgsfield Tripo 생성)을 PNG로 렌더한다.
// 실행: NODE_PATH=$(npm root -g) npm run render:props  (전역 Playwright·Chromium 필요). 결과: assets/props/<id>.png
// 살짝 위에서 비스듬히 본 모습(마을 화면에 세워 놓기 좋게). 생성물은 손으로 고치지 않는다.
import { createServer } from 'node:http';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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

const YAW = 0.5;
const PITCH = 0.35;
const out = join(root, 'tools', 'out_props');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/tools/render_chars.html`);
await page.waitForFunction('window.ready');
for (const f of readdirSync(join(root, 'assets', 'source', 'props')).filter((x) => x.endsWith('.glb')).sort()) {
  const url = await page.evaluate(([m, y, p]) => window.render(m, 0, y, p), [`../props/${f}`, YAW, PITCH]);
  writeFileSync(join(out, f.replace('.glb', '.png')), Buffer.from(url.split(',')[1], 'base64'));
  console.log(f);
}
await browser.close();
server.close();
