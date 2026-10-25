// 문구 등록부. 언어마다 src/core/locales/<코드>.ts 한 파일(UI 문구·캐릭터 이름·대사·소품 이름).
// 기준은 한국어(ko.ts의 KO_UI) — 다른 언어는 같은 키를 모두 가져야 한다(LocaleBundle 타입이 강제).
// 앱 언어는 기기 언어를 따른다(pickLocale). 지원하지 않는 언어면 영어.
import type { CharacterId } from './chapters';
import { ar } from './locales/ar';
import { bn } from './locales/bn';
import { en } from './locales/en';
import { es } from './locales/es';
import { fil } from './locales/fil';
import { fr } from './locales/fr';
import { gu } from './locales/gu';
import { he } from './locales/he';
import { hi } from './locales/hi';
import { id } from './locales/id';
import { ja } from './locales/ja';
import { kn } from './locales/kn';
import { ko, KO_UI } from './locales/ko';
import { ml } from './locales/ml';
import { mr } from './locales/mr';
import { ms } from './locales/ms';
import { pa } from './locales/pa';
import { pt } from './locales/pt';
import { sw } from './locales/sw';
import { ta } from './locales/ta';
import { te } from './locales/te';
import { th } from './locales/th';
import { tr } from './locales/tr';
import { uk } from './locales/uk';
import { ur } from './locales/ur';
import { vi } from './locales/vi';
import { zh } from './locales/zh';
import { zhHant } from './locales/zh-Hant';
import type { PropId } from './village';

export type StringKey = keyof typeof KO_UI;
export type Mood = 'start' | 'good' | 'bad' | 'hint' | 'clear';

export interface LocaleBundle {
  /** 언어 목록에 보이는 이름(그 언어로). */
  name: string;
  ui: Record<StringKey, string>;
  names: Record<CharacterId, string>;
  /** 캐릭터 대사(상황마다 1개 이상). 냥이 츤데레, 판다 느긋, 토끼 발랄, 시바 의젓한 응원단장, 오리 엉뚱·덜렁. */
  lines: Record<CharacterId, Record<Mood, string[]>>;
  props: Record<PropId, string>;
}

/** 언어 목록 순서(설정 화면). 유럽(EEA·영국)·중국 본토 출시 제외 방침에 맞춰 그 밖의 시장 언어를 넣었다. */
const BUNDLES = {
  ko,
  en,
  ja,
  zh,
  'zh-Hant': zhHant,
  es,
  pt,
  fr,
  id,
  ms,
  th,
  vi,
  fil,
  hi,
  bn,
  ta,
  te,
  mr,
  gu,
  kn,
  ml,
  pa,
  ur,
  ar,
  he,
  tr,
  uk,
  sw,
} satisfies Record<string, LocaleBundle>;

export type Locale = keyof typeof BUNDLES;
export const LOCALES = Object.keys(BUNDLES) as Locale[];
export const LOCALE_NAMES = Object.fromEntries(LOCALES.map((l) => [l, BUNDLES[l].name])) as Record<Locale, string>;
/** 오른쪽에서 왼쪽으로 쓰는 언어(글자는 기기가 알아서 RTL로 그린다. 화면 배치는 그대로). */
export const RTL_LOCALES: readonly Locale[] = ['ar', 'he', 'ur'];

/** Jua(한글·기본 영문)로 충분한 언어. 나머지는 Nunito(악센트 라틴·베트남어·키릴, src/ui/fonts.ts). */
const JUA_LOCALES: readonly Locale[] = ['ko', 'en', 'ja', 'zh', 'zh-Hant', 'id', 'ms', 'fil', 'sw'];

export function fontKindFor(locale: Locale): 'jua' | 'nunito' {
  return JUA_LOCALES.includes(locale) ? 'jua' : 'nunito';
}

export function translate(locale: Locale, key: StringKey, vars?: Record<string, string | number>): string {
  const raw = BUNDLES[locale]?.ui[key] ?? en.ui[key] ?? ko.ui[key];
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** 옛 언어 코드 → 지금 코드. */
const ALIASES: Record<string, Locale> = { iw: 'he', in: 'id', tl: 'fil', fil: 'fil' };
const TRADITIONAL_REGIONS = ['tw', 'hk', 'mo'];

/** 기기 언어 태그(예: "ko-KR", "zh-Hant-TW", "pt-BR") → 지원 언어. 모르면 영어. */
export function pickLocale(tags: readonly string[]): Locale {
  for (const tag of tags) {
    const parts = tag.toLowerCase().split(/[-_]/);
    const base = parts[0];
    if (base === 'zh') return parts.includes('hant') || parts.some((p) => TRADITIONAL_REGIONS.includes(p)) ? 'zh-Hant' : 'zh';
    if (base in ALIASES) return ALIASES[base];
    if ((LOCALES as string[]).includes(base)) return base as Locale;
  }
  return 'en';
}

// ── 캐릭터 이름·대사, 소품 이름 ──

function byLocale<K extends string>(pick: (b: LocaleBundle) => Record<K, string>, keys: readonly K[]): Record<K, Record<Locale, string>> {
  return Object.fromEntries(keys.map((k) => [k, Object.fromEntries(LOCALES.map((l) => [l, pick(BUNDLES[l])[k]]))])) as Record<
    K,
    Record<Locale, string>
  >;
}

export const CHARACTER_NAMES = byLocale((b) => b.names, Object.keys(ko.names) as CharacterId[]);
/** 마을 소품 이름(src/core/village.ts PROP_IDS). */
export const PROP_NAMES = byLocale((b) => b.props, Object.keys(ko.props) as PropId[]);

export function characterLine(ch: CharacterId, locale: Locale, mood: Mood, pick: number): string {
  const lines = (BUNDLES[locale] ?? en).lines[ch][mood];
  return lines[Math.abs(Math.floor(pick)) % lines.length];
}

/** 기준(한국어) 문구 전체(테스트용). */
export function translateKeys(): Record<StringKey, string> {
  return KO_UI;
}

/** 그 언어에 빠졌거나 빈 문구 키, 자리표시자가 기준과 다른 키(테스트용). */
export function missingKeys(locale: Locale): StringKey[] {
  const ui = BUNDLES[locale].ui as Partial<Record<StringKey, string>>;
  const holes = (s: string): string => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  return (Object.keys(KO_UI) as StringKey[]).filter((k) => !ui[k] || holes(ui[k]!) !== holes(KO_UI[k]));
}

export function bundleOf(locale: Locale): LocaleBundle {
  return BUNDLES[locale];
}
