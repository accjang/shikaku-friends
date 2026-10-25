// 술래잡기 게임 캐릭터(assets/source/models/*.glb — 고양이·판다·토끼 Tripo, 시바·오리 Meshy, Higgsfield에서 생성)를 게임용 PNG로 렌더한다.
// 실행: NODE_PATH=$(npm root -g) npm run render:chars  (전역 Playwright·Chromium 필요). 결과: tools/out/<캐릭터>_<각도>.png
// → python3 tools/crop_chars.py 로 잘라 assets/chars/에 넣는다. 생성물은 손으로 고치지 않는다.
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// playwright는 이 프로젝트 의존성이 아니다(전역 설치본을 NODE_PATH로 찾는다).
const { chromium } = createRequire(import.meta.url)('playwright');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json' };
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
const port = server.address().port;

// 자세표(tools/char_poses.json): 캐릭터마다 calm(서 있는 자세)·cheer(기뻐하는 자세)
const POSES = JSON.parse(readFileSync(join(root, 'tools', 'char_poses.json'), 'utf8'));
// 출력 이름 → [자세, 좌우 각도]
const VIEWS = { front: ['calm', 0], q: ['calm', 0.55], ql: ['calm', -0.55], cheer: ['cheer', 0.2] };
const out = join(root, 'tools', 'out');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/tools/render_chars.html`);
await page.waitForFunction('window.ready');
for (const name of ['cat', 'panda', 'rabbit', 'shiba', 'duck']) {
  for (const [view, [pose, yaw]] of Object.entries(VIEWS)) {
    const { model, t } = POSES[name][pose];
    const url = await page.evaluate(([m, tt, y]) => window.render(m, tt, y), [model, t, yaw]);
    writeFileSync(join(out, `${name}_${view}.png`), Buffer.from(url.split(',')[1], 'base64'));
    console.log(name, view);
  }
}
await browser.close();
server.close();
