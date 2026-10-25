// 결과 공유 문구(UI 없음). 오늘의 퍼즐은 Wordle처럼 번호·시간·별·연속 일수만 — 정답 모양은 넣지 않는다.
import { DAILY_EPOCH, STORE_URL } from './config';
import { translate, type Locale } from './i18n';

const DAY_MS = 24 * 60 * 60 * 1000;

/** 오늘의 퍼즐 번호(#1 = DAILY_EPOCH). 날짜 키는 현지 날짜(YYYY-MM-DD). */
export function dailyNumber(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [ey, em, ed] = DAILY_EPOCH.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / DAY_MS) + 1;
}

export function formatClock(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const stars = (n: number): string => '⭐'.repeat(n) + '☆'.repeat(3 - n);

interface DailyShare {
  dateKey: string;
  ms: number;
  hintsUsed: number;
  streak: number;
}

export function dailyShareText(locale: Locale, s: DailyShare, url: string = STORE_URL): string {
  const lines = [
    translate(locale, 'shareDailyTitle', { n: dailyNumber(s.dateKey) }),
    `⏱ ${formatClock(s.ms)} · 💡 ${s.hintsUsed}${s.streak > 1 ? ` · 🔥 ${translate(locale, 'streak', { n: s.streak })}` : ''}`,
    hintStrip(s.hintsUsed),
  ];
  if (url) lines.push(url);
  return lines.join('\n');
}

/** 힌트를 안 쓰면 🟩 다섯 개, 쓸수록 🟨로 바뀐다(정답은 드러내지 않는 장식 줄). */
export function hintStrip(hintsUsed: number): string {
  const used = Math.min(5, hintsUsed);
  return '🟨'.repeat(used) + '🟩'.repeat(5 - used);
}

interface StageShare {
  id: string;
  stars: number;
  ms: number;
}

export function stageShareText(locale: Locale, s: StageShare, url: string = STORE_URL): string {
  const lines = [translate(locale, 'shareStageTitle', { id: s.id }), `${stars(s.stars)} · ⏱ ${formatClock(s.ms)}`];
  if (url) lines.push(url);
  return lines.join('\n');
}
