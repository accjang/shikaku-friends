// 소개자료 PDF 만들기: node tools/gen_intro_pdf.mjs → docs/intro/shikaku-friends-intro.pdf
// 스토어 그림(docs/store/art/ko)·캐릭터·그림 앨범·소품을 그대로 쓴다. 내용은 README·config 기준(바뀌면 여기 문구도 고친다).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (p) => readFileSync(join(root, p)).toString('base64');
const img = (p) => `data:image/${p.endsWith('.png') ? 'png' : 'jpeg'};base64,${b64(p)}`;
const CHARS = [
  ['cat', '냥이', '츤데레', '1장 냥이의 방', '5×5 → 7×8', '#ECE8F8', '#7D70AE'],
  ['panda', '판다', '느긋', '2장 판다의 대나무숲', '8×8 → 9×9', '#E3F5EA', '#4E9E70'],
  ['rabbit', '토끼', '발랄', '3장 토끼의 당근밭', '9×10 → 10×11', '#FFE8EE', '#E07597'],
  ['shiba', '시바', '의젓한 응원단장', '4장 시바의 산책길', '10×11 → 10×12', '#FFF0E0', '#D9792E'],
  ['duck', '오리', '엉뚱 덜렁', '5장 오리의 연못', '10×12 → 10×14', '#FFF9DC', '#C9A21A'],
];
const SHOTS = ['귀여운 친구들과 두뇌 퍼즐', '드래그 한 번으로 네모 그리기', '다 풀면 숨은 그림이 짠!', '소품을 모아 마을을 꾸며요', '300개 스테이지, 답은 하나뿐'];
const FEATURES = [
  ['🧩', '300 스테이지', '5개 챕터 × 60판. 모든 퍼즐은 답이 하나뿐인지 풀이기로 검증'],
  ['📅', '오늘의 퍼즐', '전 세계 같은 퍼즐, 7일 연속 보상, 하루 빠져도 지켜 주는 연속 기록 보호, 지난 퍼즐 달력'],
  ['💡', '이유를 알려 주는 힌트', '"숫자 6: 놓을 자리가 여기뿐이에요"처럼 왜 그런지 말풍선으로 설명'],
  ['❤️', '하트 3개', '한 판에 3번까지 실수 OK. 잠깐 잘못 그린 건 세지 않아요'],
  ['🖼️', '그림 앨범', '다 풀면 숨은 그림이 열려요. 캐릭터마다 4장, 모두 20장 수집'],
  ['🏡', '마을 꾸미기', '15판마다 소품 하나. 20개를 모으면 친구들의 집 완성'],
  ['🔔', '매일 알림', '저녁 7시, 그날 퍼즐을 안 풀었을 때만 (기본 꺼짐)'],
  ['✈️', '오프라인 · 시간 제한 없음', '로그인 없이 바로 시작, 인터넷 없어도 플레이'],
];
const PROPS = ['flowers', 'bench', 'well', 'willow', 'lamp', 'picnic', 'bunting', 'house'];
const page = (cls, body) => `<section class="page ${cls}">${body}<div class="foot">시카쿠 프렌즈 · Shikaku Friends</div></section>`;

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@font-face{font-family:Jua;src:url(data:font/ttf;base64,${b64('node_modules/@expo-google-fonts/jua/400Regular/Jua_400Regular.ttf')})}
@page{size:1280px 720px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Jua,sans-serif;color:#4B3F6B}
.page{width:1280px;height:720px;position:relative;overflow:hidden;background:#FFF1E2;padding:56px 64px;page-break-after:always}
.foot{position:absolute;left:64px;bottom:24px;font-size:14px;color:#8C80A8}
h1{font-size:44px;margin-bottom:8px}
.sub{font-size:21px;color:#8C80A8;margin-bottom:28px}
.pill{display:inline-block;background:#FF7FA3;color:#fff;border-radius:999px;padding:6px 18px;font-size:18px}
.card{background:#fff;border-radius:24px;padding:22px 24px;box-shadow:0 6px 0 #EADFD3}
.cover{background:linear-gradient(160deg,#FFE3EC,#FFF1E2 55%,#FFE9C2);display:flex;align-items:center;gap:40px}
.cover .t{flex:1}
.cover h1{font-size:84px;line-height:1.05;margin:18px 0 6px}
.cover .en{font-size:30px;color:#E9658B;margin-bottom:22px}
.cover p{font-size:24px;line-height:1.5;color:#6A5E8C}
.cover .icon{width:132px;height:132px;border-radius:30px;box-shadow:0 8px 0 #EBC9B4}
.cover .phone{height:600px;border-radius:36px;box-shadow:0 14px 40px rgba(122,92,140,.28)}
.row{display:flex;gap:22px}
.rule{flex:1;font-size:25px;line-height:1.45}
.rule b{display:block;font-size:54px;color:#FF7FA3;font-weight:400}
.shots{display:flex;gap:18px;justify-content:center}
.shots figure{width:216px;text-align:center}
.shots img{width:216px;border-radius:22px;box-shadow:0 8px 22px rgba(122,92,140,.22)}
.shots figcaption{font-size:16px;margin-top:10px;color:#6A5E8C}
.chars{display:flex;gap:16px}
.ch{flex:1;border-radius:24px;padding:18px 12px 20px;text-align:center}
.ch img{height:170px}
.ch .n{font-size:30px;margin-top:6px}
.ch .p{font-size:17px;margin:2px 0 12px}
.ch .c{font-size:17px;color:#4B3F6B}
.ch .s{font-size:15px;color:#8C80A8;margin-top:4px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px 20px}
.f{display:flex;gap:16px;align-items:center;padding:16px 20px}
.f .e{font-size:38px;width:50px;text-align:center}
.f .h{font-size:23px}
.f .d{font-size:15.5px;color:#8C80A8;line-height:1.4;margin-top:3px}
.strip{display:flex;gap:12px;flex-wrap:wrap}
.strip img{width:132px;height:132px;border-radius:16px;image-rendering:pixelated;box-shadow:0 4px 0 #EADFD3}
.props{display:flex;gap:6px;align-items:flex-end;justify-content:space-between;margin-top:8px}
.props img{height:96px}
.big{font-size:60px;color:#FF7FA3}
.kv{flex:1;text-align:center}
.kv .l{font-size:19px;color:#8C80A8;margin-top:4px}
ul{list-style:none;font-size:20px;line-height:1.75}
li:before{content:"· ";color:#FF7FA3}
table{width:100%;border-collapse:collapse;font-size:19px}
td{padding:11px 8px;border-bottom:2px solid #F3E8DC;vertical-align:top}
td:first-child{width:210px;color:#8C80A8}
.ok{color:#4E9E70}.wait{color:#D9792E}
</style></head><body>
${page('cover', `<div class="t"><img class="icon" src="${img('docs/store/art/icon-512.png')}"><h1>시카쿠 프렌즈</h1><div class="en">Shikaku Friends</div>
<p>숫자만큼 네모를 그려 판을 나누는<br>귀여운 동물 친구들의 두뇌 퍼즐</p><p style="margin-top:22px"><span class="pill">iOS · Android</span> <span class="pill" style="background:#FFC23D">무료</span> <span class="pill" style="background:#9ED9B5">28개 언어</span></p></div>
<img class="phone" src="${img('docs/store/art/ko/ios-1.jpg')}">`)}
${page('', `<h1>어떤 게임인가요?</h1><div class="sub">일본의 인기 논리 퍼즐 '시카쿠(四角)'를 동물 친구들과 함께</div>
<div class="row"><div class="card rule"><b>규칙 1</b>판을 직사각형으로 나눠요.</div><div class="card rule"><b>규칙 2</b>네모 하나에는 숫자가 딱 하나,<br>그 숫자가 네모의 칸 수예요.</div>
<div class="card rule"><b>조작</b>드래그 한 번으로 네모 그리기,<br>탭하면 지우기.</div></div>
<div class="row" style="margin-top:26px"><div class="card" style="flex:1"><ul><li>스도쿠·노노그램처럼 규칙은 쉽고, 풀수록 깊어지는 논리 퍼즐</li><li>처음 실행하면 규칙 설명과 4×4 연습 판으로 바로 익혀요</li><li>시간 제한 없이 천천히, 한 판 1~5분</li></ul></div>
<div class="card" style="flex:1"><ul><li>친구들이 움직이며 칭찬도 하고 투정도 부려요</li><li>다 풀면 숨어 있던 그림이 창문처럼 열려요</li><li>깰수록 소품이 모여 친구들의 마을이 완성돼요</li></ul></div></div>`)}
${page('', `<h1>화면</h1><div class="sub">App Store · Google Play 스토어 스크린샷 (28개 언어로 제작)</div>
<div class="shots">${SHOTS.map((s, i) => `<figure><img alt="${s}" src="${img(`docs/store/art/ko/ios-${i + 1}.jpg`)}"></figure>`).join('')}</div>`)}
${page('', `<h1>다섯 친구, 다섯 챕터</h1><div class="sub">챕터마다 안내하는 친구가 달라지고, 판은 점점 커져요 · 앞 챕터에서 15판을 깨면 다음 챕터가 열려요</div>
<div class="chars">${CHARS.map(([id, n, p, c, s, bg, dk]) => `<div class="ch" style="background:${bg}"><img src="${img(`assets/chars/${id}_front.png`)}"><div class="n" style="color:${dk}">${n}</div><div class="p" style="color:${dk}">${p}</div><div class="c">${c}</div><div class="s">60판 · ${s}</div></div>`).join('')}</div>`)}
${page('', `<h1>주요 기능</h1><div class="sub">매일 돌아오게 하는 장치와, 막혀도 포기하지 않게 하는 장치</div>
<div class="grid">${FEATURES.map(([e, h, d]) => `<div class="card f"><div class="e">${e}</div><div><div class="h">${h}</div><div class="d">${d}</div></div></div>`).join('')}</div>`)}
${page('', `<h1>모으는 재미</h1><div class="sub">그림 앨범 20장 · 마을 소품 20개</div>
<div class="row"><div class="card" style="flex:1.25"><div style="font-size:23px;margin-bottom:14px">🖼️ 그림 앨범 — 15판마다 새 그림</div>
<div class="strip">${['cat_1', 'panda_2', 'rabbit_3', 'shiba_4', 'duck_1', 'cat_3', 'panda_4', 'rabbit_2'].map((p) => `<img src="${img(`assets/postcards/${p}.png`)}">`).join('')}</div></div>
<div class="card" style="flex:1"><div style="font-size:23px;margin-bottom:10px">🏡 마을 꾸미기 — 15판마다 소품 하나</div>
<div class="props">${PROPS.slice(0, 4).map((p) => `<img src="${img(`assets/props/${p}.png`)}">`).join('')}</div><div class="props">${PROPS.slice(4).map((p) => `<img src="${img(`assets/props/${p}.png`)}">`).join('')}</div>
<p style="font-size:17px;color:#8C80A8;margin-top:16px;line-height:1.5">꽃밭·벤치·우물·버드나무… 아직 못 얻은 소품은 흐린 그림자로 보여요. 마지막 20번째는 친구들의 집.</p></div></div>`)}
${page('', `<h1>규모와 수익 모델</h1><div class="sub">한 번 만든 코드로 iOS·Android 동시 출시</div>
<div class="card row" style="margin-bottom:22px"><div class="kv"><div class="big">300</div><div class="l">스테이지</div></div><div class="kv"><div class="big">5</div><div class="l">캐릭터 · 챕터</div></div><div class="kv"><div class="big">28</div><div class="l">지원 언어</div></div><div class="kv"><div class="big">365</div><div class="l">일 매일 새 퍼즐</div></div></div>
<div class="row"><div class="card" style="flex:1"><div style="font-size:24px;margin-bottom:8px">무료 + 광고</div><ul><li>처음 5판은 광고 없음</li><li>이후 3판마다 '다음'을 누를 때 전면 광고 (최소 3분 간격)</li><li>보상형 광고는 원할 때만: 힌트 받기, 하트를 다 썼을 때 이어 하기</li></ul></div>
<div class="card" style="flex:1"><div style="font-size:24px;margin-bottom:8px">광고 제거 <span style="color:#FF7FA3">₩1,900 / US$1.99</span></div><ul><li>한 번 구매(비소모성), 구매 복원 지원</li><li>전면 광고 없음 + 힌트 10개</li><li>콘텐츠 잠금 없음 — 300판 모두 무료</li></ul></div></div>`)}
${page('', `<h1>출시 준비 현황</h1><div class="sub">2026년 11월 26일 기준</div>
<div class="card"><table>
<tr><td>게임 개발</td><td><span class="ok">완료</span> — 300 스테이지, 오늘의 퍼즐, 앨범, 마을, 알림, 28개 언어 · 실기기(iPhone) 동작 확인</td></tr>
<tr><td>스토어 자료</td><td><span class="ok">완료</span> — 28개 언어 문구·스크린샷·대표 이미지, 개인정보처리방침·지원 페이지 게시</td></tr>
<tr><td>App Store (iOS)</td><td><span class="wait">진행 중</span> — 앱·연령 등급·가격(무료, 142개국)·인앱 상품 등록 완료, 26개 언어 문구 업로드 중 → 빌드 업로드·TestFlight·심사 제출 예정</td></tr>
<tr><td>광고 · 결제</td><td><span class="wait">진행 중</span> — AdMob 광고 단위·RevenueCat 연결 완료, 유료 앱 계약 승인 대기 후 실결제 확인 예정</td></tr>
<tr><td>Google Play</td><td>iOS 출시 뒤 진행 — 같은 코드, 스토어 자료 준비됨</td></tr>
<tr><td>출시 지역</td><td>EEA·영국·중국 본토를 제외한 전 세계</td></tr>
</table></div>
<p style="font-size:19px;color:#6A5E8C;margin-top:26px">만든 곳 — 주식회사 청림정원 (CHUNGLIMJUNGWON Co.,Ltd.) · 문의 gpawod2@gmail.com</p>`)}
</body></html>`;

const browser = await chromium.launch();
const p = await browser.newPage();
await p.setContent(html, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
const out = join(root, 'docs', 'intro', 'shikaku-friends-intro.pdf');
await p.pdf({ path: out, width: '1280px', height: '720px', printBackground: true });
await browser.close();
console.log(out);
