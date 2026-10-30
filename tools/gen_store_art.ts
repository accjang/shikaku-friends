// 스토어 그림 생성: 언어별 스크린샷(App Store 6.9인치·Google Play 휴대전화)과 Play 그래픽 이미지, Play 512 아이콘.
// 웹 빌드(dist/)를 Playwright로 띄워 장면마다 진행 기록을 심고 화면을 찍은 뒤, 위에 그 언어 문구를 얹어 합성한다.
// 문구는 docs/store/listing/<코드>.md의 `- shots:`(| 로 나눈 5개)와 `- title:`.
// 실행: npx expo export -p web && npx tsx tools/gen_store_art.ts [언어코드... | all]   (기본 ko en)
// 결과: docs/store/art/icon-512.png, docs/store/art/<코드>/{ios-1~5.jpg, play-1~5.jpg, feature.png}
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, createReadStream } from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join } from 'node:path';

import { chromium, type Browser, type Page } from 'playwright';

import { CHAPTERS, levelCount, levelId } from '../src/core/chapters';
import { CLEAR_DELAY_MS, STORAGE_KEYS, STORAGE_VERSION } from '../src/core/config';
import { dateKey, prevDateKey } from '../src/core/daily';
import { fontKindFor, LOCALES, RTL_LOCALES, type Locale } from '../src/core/i18n';
import type { Progress } from '../src/core/progress';
import { colors, RECT_PALETTE } from '../src/ui/theme';

const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'docs', 'store', 'art');
const LEVELS = JSON.parse(readFileSync(join(ROOT, 'content', 'levels.json'), 'utf8')) as Record<
  string,
  { w: number; h: number; s: [number, number, number, number][] }
>;

/** 앱 화면을 찍는 크기: iPhone 6.9인치(440×956pt @3x = 1320×2868). */
const DEVICE = { width: 440, height: 956, scale: 3 };
/** 합성 결과 크기. App Store 6.9인치, Play 휴대전화(9:16, 긴 변이 짧은 변의 2배 이하). */
const TARGETS = {
  ios: { width: 1320, height: 2868 },
  play: { width: 1080, height: 1920 },
} as const;
const FEATURE = { width: 1024, height: 500 };
const PLAY_ICON = 512;
const JPEG_QUALITY = 90;
/** 화면이 자리 잡을 때까지 기다리는 시간(글꼴·캐릭터 그림·등장 애니메이션). */
const SETTLE_MS = 2500;
/** 다 풀고 그림이 드러난 뒤, 클리어 창(CLEAR_DELAY_MS 뒤)이 뜨기 전. */
const REVEAL_SETTLE_MS = CLEAR_DELAY_MS - 300;

// 장면마다 배경색(챕터 색과 맞춤)
const SCENE_BG = ['#FFD6E2', '#D7F0E0', '#FFE3C2', '#DCEBFF', '#E9E1FF'];

// ── 글꼴: 앱의 Jua/Nunito 위에, 기기에 있을 문자(인도계·아랍·히브리·태국·한자)를 Noto로 채운다(웹 빌드 미리보기용) ──
const NOTO = ['thai', 'devanagari', 'bengali', 'tamil', 'telugu', 'gujarati', 'kannada', 'malayalam', 'gurmukhi', 'arabic', 'hebrew', 'jp', 'sc', 'tc'];
const SKIP_SUBSETS = /-(latin|latin-ext|cyrillic|cyrillic-ext|greek|greek-ext|vietnamese)-700-normal$/;

/** family 이름으로 Noto 글자 묶음(@font-face, unicode-range)을 만든다. 주소는 정적 서버의 /__fonts/. */
function notoFaces(family: string): string {
  const out: string[] = [];
  for (const s of NOTO) {
    const dir = `@fontsource/noto-sans-${s}`;
    const css = readFileSync(join(ROOT, 'node_modules', dir, '700.css'), 'utf8');
    for (const m of css.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face \{([^}]*)\}/g)) {
      if (SKIP_SUBSETS.test(m[1])) continue;
      const body = m[2]
        .replace(/font-family: '[^']+';/, `font-family: '${family}';`)
        .replace(/font-weight: \d+;/, 'font-weight: normal;')
        .replace(/url\(\.\/files\//g, `url(/__fonts/${dir}/files/`);
      out.push(`@font-face {${body}}`);
    }
  }
  return out.join('\n');
}

function roundFontFile(locale: Locale): string {
  return fontKindFor(locale) === 'jua'
    ? '/__fonts/@expo-google-fonts/jua/400Regular/Jua_400Regular.ttf'
    : '/__fonts/@expo-google-fonts/nunito/800ExtraBold/Nunito_800ExtraBold.ttf';
}

// ── 정적 서버(dist/ + node_modules 글꼴) ──
const TYPES: Record<string, string> = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4',
};

function serve(): Promise<http.Server> {
  const srv = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = url.startsWith('/__fonts/') ? join(ROOT, 'node_modules', url.slice('/__fonts/'.length))
      : url.startsWith('/__assets/') ? join(ROOT, 'assets', url.slice('/__assets/'.length))
      : join(DIST, url);
    if (!file.startsWith(ROOT)) file = join(DIST, 'index.html');
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html'); // expo-router 단일 페이지
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) => srv.listen(0, () => ok(srv)));
}

// ── 진행 기록 심기 ──
function cleared(upTo: { chapter: number; level: number }, twoStarEvery = 0): Progress['levels'] {
  const levels: Progress['levels'] = {};
  for (const ch of CHAPTERS) {
    for (let lv = 1; lv <= levelCount(ch); lv++) {
      if (ch.id > upTo.chapter || (ch.id === upTo.chapter && lv > upTo.level)) return levels;
      levels[levelId(ch.id, lv)] = { stars: twoStarEvery && lv % twoStarEvery === 0 ? 2 : 3, bestMs: 40_000 + lv * 1_000 };
    }
  }
  return levels;
}

function progressWith(levels: Progress['levels']): Progress {
  // 오늘의 퍼즐은 어제까지 4일 연속(홈에 '🔥 4일 연속'이 보이게)
  const daily: Record<string, number> = {};
  let k = prevDateKey(dateKey(new Date()));
  for (let i = 0; i < 4; i++, k = prevDateKey(k)) daily[k] = 60_000;
  return { levels, daily, hints: 5, totalClears: Object.keys(levels).length + 4, tutorialDone: true };
}

interface Scene {
  route: string;
  progress: Progress;
  act?: (page: Page) => Promise<void>;
}

/** 판 위 칸 → 화면 좌표(판 테두리 2 + 안쪽 여백 4). */
async function boardCell(page: Page, id: string): Promise<(x: number, y: number) => { x: number; y: number }> {
  const box = await page.getByLabel('board').boundingBox();
  if (!box) throw new Error('판을 못 찾음');
  const inset = 6;
  const cell = (box.width - inset * 2) / LEVELS[id].w;
  return (x, y) => ({ x: box.x + inset + (x + 0.5) * cell, y: box.y + inset + (y + 0.5) * cell });
}

async function drag(page: Page, at: (x: number, y: number) => { x: number; y: number }, r: number[], release = true): Promise<void> {
  const [x, y, w, h] = r;
  const a = at(x, y);
  const b = at(x + w - 1, y + h - 1);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 4 });
  await page.mouse.move(b.x, b.y, { steps: 4 });
  if (release) await page.mouse.up();
}

/** 해답 네모를 놓는다. leave개는 남기고, hold가 있으면 마지막 하나는 드래그 중인 채로 둔다. */
async function placeSolution(page: Page, id: string, leave: number, hold: boolean): Promise<void> {
  const at = await boardCell(page, id);
  const sol = LEVELS[id].s;
  const placed = sol.slice(0, sol.length - leave);
  for (const r of placed) {
    await drag(page, at, r);
    await page.waitForTimeout(60);
  }
  if (hold) {
    // 가장 큰 남은 네모를 드래그하는 중(크기 표시 "3×2=6"이 보이게)
    const rest = sol.slice(sol.length - leave).sort((p, q) => q[2] * q[3] - p[2] * p[3]);
    await drag(page, at, rest[0], false);
  }
}

const PLAY_LEVEL = '2-25';
const CLEAR_LEVEL = '1-30';

const SCENES: Scene[] = [
  // 1. 홈: 다섯 친구 + 제목
  { route: '/', progress: progressWith(cleared({ chapter: 3, level: 12 }, 5)) },
  // 2. 드래그로 네모 그리기
  {
    route: `/play/${PLAY_LEVEL}`,
    progress: progressWith(cleared({ chapter: 2, level: 24 }, 5)),
    act: async (page) => {
      await placeSolution(page, PLAY_LEVEL, 6, true);
      await page.waitForTimeout(400);
    },
  },
  // 3. 다 풀면 그림 공개 + 클리어 창
  {
    route: `/play/${CLEAR_LEVEL}`,
    progress: progressWith(cleared({ chapter: 1, level: 29 }, 5)),
    act: async (page) => {
      await placeSolution(page, CLEAR_LEVEL, 0, false);
      await page.waitForTimeout(REVEAL_SETTLE_MS);
    },
  },
  // 4. 소품을 다 모은 마을
  { route: '/village', progress: progressWith(cleared({ chapter: CHAPTERS.length, level: 99 }, 4)) },
  // 5. 스테이지 목록(별이 채워진 챕터)
  { route: '/stages', progress: progressWith(cleared({ chapter: 3, level: 23 }, 4)) },
];

async function shootScenes(browser: Browser, base: string, locale: Locale): Promise<Buffer[]> {
  const fontCss = notoFaces('Round');
  const shots: Buffer[] = [];
  for (const scene of SCENES) {
    const ctx = await browser.newContext({
      viewport: { width: DEVICE.width, height: DEVICE.height },
      deviceScaleFactor: DEVICE.scale,
      locale,
      hasTouch: false,
    });
    // 함수로 넘기면 tsx가 넣는 도우미(__name)가 브라우저에 없어 깨지므로 문자열로 넘긴다
    // 웹의 키보드 초점 테두리는 기기에 없으므로 지운다
    const css = `${fontCss}\n*:focus, *:focus-visible { outline: none !important; }`;
    const seed = { keys: STORAGE_KEYS, version: STORAGE_VERSION, progress: scene.progress, locale, css };
    await ctx.addInitScript(`(() => {
      const p = ${JSON.stringify(seed)};
      const env = (data) => JSON.stringify({ version: p.version, data });
      localStorage.setItem(p.keys.progress, env(p.progress));
      localStorage.setItem(p.keys.settings, env({ sound: false, haptics: false, locale: p.locale, companion: null }));
      // 광고 제거 상태(가상 결제)로 두어 광고 자리·제안이 안 보이게
      localStorage.setItem(p.keys.mockPurchases, env(true));
      localStorage.setItem(p.keys.adFreeGranted, env(true));
      document.addEventListener('DOMContentLoaded', () => {
        const s = document.createElement('style');
        s.textContent = p.css;
        document.head.appendChild(s);
      });
    })();`);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.warn(`  [${locale} ${scene.route}] ${e.message}`));
    await page.goto(base + scene.route);
    await page.waitForTimeout(SETTLE_MS);
    if (scene.act) await scene.act(page);
    shots.push(await page.screenshot({ type: 'png' }));
    await ctx.close();
  }
  return shots;
}

// ── 합성 ──
function listingField(locale: Locale, name: string): string {
  const t = readFileSync(join(ROOT, 'docs', 'store', 'listing', `${locale}.md`), 'utf8');
  const v = new RegExp(`^- ${name}: (.*)$`, 'm').exec(t)?.[1]?.trim();
  if (!v) throw new Error(`docs/store/listing/${locale}.md에 ${name} 없음`);
  return v;
}

function captionsFor(locale: Locale): string[] {
  const caps = listingField(locale, 'shots').split('|').map((s) => s.trim());
  if (caps.length !== SCENES.length) throw new Error(`${locale}: shots 문구는 ${SCENES.length}개여야 해요(지금 ${caps.length}개)`);
  return caps;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function pageHead(locale: Locale, w: number, h: number): string {
  return `<!doctype html><html lang="${locale}" dir="${RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Cap'; src: url(${roundFontFile(locale)}); }
${notoFaces('Cap')}
html, body { margin: 0; width: ${w}px; height: ${h}px; overflow: hidden; }
body { font-family: 'Cap', sans-serif; color: ${colors.ink}; }
</style></head>`;
}

function shotHtml(locale: Locale, target: { width: number; height: number }, shot: string, caption: string, bg: string): string {
  const { width: W, height: H } = target;
  const top = Math.round(H * 0.15); // 문구 자리
  const frameH = H - top - Math.round(H * 0.035);
  const frameW = Math.round((frameH * DEVICE.width) / DEVICE.height);
  const border = Math.round(W * 0.018);
  const fs = Math.round(W * 0.07);
  return `${pageHead(locale, W, H)}<body style="background:${bg}">
<div style="height:${top}px;display:flex;align-items:center;justify-content:center;padding:0 ${Math.round(W * 0.06)}px;box-sizing:border-box">
  <div style="font-size:${fs}px;line-height:1.25;text-align:center;word-break:keep-all">${esc(caption)}</div>
</div>
<div style="display:flex;justify-content:center">
  <div style="width:${frameW}px;height:${frameH}px;border:${border}px solid #fff;border-radius:${Math.round(W * 0.07)}px;overflow:hidden;box-shadow:0 ${Math.round(W * 0.01)}px ${Math.round(W * 0.04)}px rgba(75,63,107,0.18);background:${colors.bg}">
    <img src="${shot}" style="width:100%;height:100%;display:block;object-fit:cover">
  </div>
</div></body></html>`;
}

function featureHtml(locale: Locale): string {
  const { width: W, height: H } = FEATURE;
  // 제목은 '이름 - 설명' / '이름: 설명' 꼴
  const [name, sub] = listingField(locale, 'title').split(/\s[-–]\s|:\s|：/).map((s) => s.trim());
  const subtitle = listingField(locale, 'subtitle');
  const rtl = RTL_LOCALES.includes(locale);
  const chars = ['duck', 'cat', 'panda', 'rabbit', 'shiba'];
  const tiles = RECT_PALETTE.slice(0, 5)
    .map((c, i) => `<div style="position:absolute;width:${70 + (i % 3) * 30}px;height:${60 + ((i + 1) % 3) * 30}px;background:${c};border-radius:18px;opacity:0.55;left:${[30, 880, 120, 930, 470][i]}px;top:${[30, 40, 380, 360, 430][i]}px"></div>`)
    .join('');
  // 캐릭터 그림은 384 정사각형(좌우 여백 있음) → 겹쳐 세운다
  const charImgs = chars
    .map((c, i) => {
      const size = i === 2 ? 230 : 175;
      return `<img src="/__assets/chars/${c}_front.png" style="width:${size}px;height:${size}px;margin:0 -34px;position:relative;z-index:${i === 2 ? 1 : 0}">`;
    })
    .join('');
  const side = rtl ? 'right' : 'left';
  const other = rtl ? 'left' : 'right';
  return `${pageHead(locale, W, H)}<body style="background:${colors.bg};position:relative">
${tiles}
<div style="position:absolute;${side}:56px;top:0;bottom:0;width:400px;display:flex;flex-direction:column;justify-content:center;text-align:${side}">
  <div style="font-size:${[...name].length > 12 ? 50 : 64}px;line-height:1.1">${esc(name)}</div>
  ${sub ? `<div style="font-size:30px;color:${colors.primaryDark};margin-top:10px">${esc(sub)}</div>` : ''}
  <div style="font-size:24px;color:${colors.inkSoft};margin-top:14px">${esc(subtitle)}</div>
</div>
<div style="position:absolute;${other}:24px;bottom:60px;width:470px;display:flex;justify-content:center;align-items:flex-end">${charImgs}</div></body></html>`;
}

async function render(browser: Browser, base: string, html: string, size: { width: number; height: number }, file: string, type: 'png' | 'jpeg'): Promise<void> {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  // 글꼴·그림 주소가 정적 서버 기준이 되도록 같은 출처에서 연다
  await page.route(`${base}/__art`, (r) => r.fulfill({ contentType: 'text/html', body: html }));
  await page.goto(`${base}/__art`);
  await page.evaluate('document.fonts.ready');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: file, type, ...(type === 'jpeg' ? { quality: JPEG_QUALITY } : {}) });
  await ctx.close();
}

async function main(): Promise<void> {
  if (!existsSync(join(DIST, 'index.html'))) throw new Error('dist/가 없어요. 먼저 npx expo export -p web');
  const args = process.argv.slice(2);
  const locales: Locale[] = args.includes('all') ? [...LOCALES] : args.length ? (args as Locale[]) : ['ko', 'en'];
  for (const l of locales) if (!LOCALES.includes(l)) throw new Error(`모르는 언어: ${l}`);

  const srv = await serve();
  const base = `http://localhost:${(srv.address() as AddressInfo).port}`;
  const browser = await chromium.launch();
  try {
    mkdirSync(OUT, { recursive: true });
    const iconHtml = `<!doctype html><body style="margin:0"><img src="/__assets/brand/icon.png" style="width:${PLAY_ICON}px;height:${PLAY_ICON}px;display:block"></body>`;
    await render(browser, base, iconHtml, { width: PLAY_ICON, height: PLAY_ICON }, join(OUT, 'icon-512.png'), 'png');

    for (const locale of locales) {
      const dir = join(OUT, locale);
      mkdirSync(dir, { recursive: true });
      const caps = captionsFor(locale);
      const shots = await shootScenes(browser, base, locale);
      for (let i = 0; i < shots.length; i++) {
        const src = `data:image/png;base64,${shots[i].toString('base64')}`;
        for (const [kind, size] of Object.entries(TARGETS)) {
          await render(browser, base, shotHtml(locale, size, src, caps[i], SCENE_BG[i % SCENE_BG.length]), size, join(dir, `${kind}-${i + 1}.jpg`), 'jpeg');
        }
      }
      await render(browser, base, featureHtml(locale), FEATURE, join(dir, 'feature.png'), 'png');
      console.log(`${locale}: ${readdirSync(dir).length}장`);
    }
  } finally {
    await browser.close();
    srv.close();
  }
}

void main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
