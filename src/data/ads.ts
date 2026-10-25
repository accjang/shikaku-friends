// 광고(AdMob, react-native-google-mobile-ads). 빈도 규칙은 src/core/adPolicy.ts, 여기서는 SDK 연결·표시만.
// 렐로(relo-app/src/data/ads.ts)와 같은 방식: 실패는 전부 조용히 넘긴다(광고 때문에 게임이 멈추면 안 된다).
// - 단위 ID: 개발 빌드는 구글 TestIds, 릴리스는 config ADMOB_UNIT_IDS(비어 있으면 그 광고를 끈다).
// - 순서(처음 한 번): ① 유럽 동의(UMP) ② iOS ATT(허용이 아니면 비맞춤형) ③ SDK 초기화 → 전면·보상형 미리 불러오기.
// - Expo Go·웹·테스트에는 네이티브 모듈이 없으므로 광고 없이 동작한다(보상형은 "불러올 수 없음").
import { Platform } from 'react-native';
import { create } from 'zustand';

import { ADMOB_UNIT_IDS, STORAGE_KEYS } from '@/core/config';
import { shouldShowInterstitial } from '@/core/adPolicy';

import { loadAdsModule } from './nativeModules';
import { loadJson, saveJson } from './storage';

type AdsModule = typeof import('react-native-google-mobile-ads');
type AdKind = 'interstitial' | 'rewarded';
interface FullScreenAd {
  load(): void;
  show(): Promise<void>;
  loaded: boolean;
  addAdEventListener(type: string, listener: (...args: unknown[]) => void): () => void;
}

interface AdStore {
  lastInterstitialAt: number | null;
  rewardedLoaded: boolean;
  privacyOptionsRequired: boolean;
}

export const useAdStore = create<AdStore>()(() => ({ lastInterstitialAt: null, rewardedLoaded: false, privacyOptionsRequired: false }));

const isDev = (): boolean => typeof __DEV__ !== 'undefined' && __DEV__ === true;

let sdk: AdsModule | null | undefined;
function adsModule(): AdsModule | null {
  if (sdk === undefined) sdk = loadAdsModule();
  return sdk;
}

export function adUnitId(kind: AdKind): string | null {
  const m = adsModule();
  if (!m) return null;
  if (isDev()) return kind === 'interstitial' ? m.TestIds.INTERSTITIAL : m.TestIds.REWARDED;
  const id = (Platform.OS === 'android' ? ADMOB_UNIT_IDS.android : ADMOB_UNIT_IDS.ios)[kind];
  return id === '' ? null : id;
}

let initializing: Promise<boolean> | null = null;
let nonPersonalized = true;
let interstitial: FullScreenAd | null = null;
let rewarded: FullScreenAd | null = null;

async function requestTracking(): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tracking = require('expo-tracking-transparency') as typeof import('expo-tracking-transparency');
    let perm = await tracking.getTrackingPermissionsAsync();
    if (!perm.granted && perm.canAskAgain && perm.status === 'undetermined') perm = await tracking.requestTrackingPermissionsAsync();
    return perm.granted;
  } catch {
    return false;
  }
}

function notePrivacy(info: unknown): void {
  const status = (info as { privacyOptionsRequirementStatus?: unknown } | null)?.privacyOptionsRequirementStatus;
  useAdStore.setState({ privacyOptionsRequired: status === 'REQUIRED' });
}

function safeLoad(ad: FullScreenAd | null): void {
  try {
    ad?.load();
  } catch {
    // 다음 기회에
  }
}

function createAd(m: AdsModule, kind: AdKind): FullScreenAd | null {
  const unit = adUnitId(kind);
  if (!unit) return null;
  try {
    const opts = { requestNonPersonalizedAdsOnly: nonPersonalized };
    const ad = (kind === 'interstitial'
      ? m.InterstitialAd.createForAdRequest(unit, opts)
      : m.RewardedAd.createForAdRequest(unit, opts)) as unknown as FullScreenAd;
    if (kind === 'rewarded') {
      ad.addAdEventListener(m.RewardedAdEventType.LOADED, () => useAdStore.setState({ rewardedLoaded: true }));
    }
    ad.addAdEventListener(m.AdEventType.CLOSED, () => {
      if (kind === 'rewarded') useAdStore.setState({ rewardedLoaded: false });
      safeLoad(ad);
    });
    ad.addAdEventListener(m.AdEventType.ERROR, () => {
      if (kind === 'rewarded') useAdStore.setState({ rewardedLoaded: false });
    });
    safeLoad(ad);
    return ad;
  } catch {
    return null;
  }
}

/** 동의 → ATT → 초기화 → 미리 불러오기(한 번만). 튜토리얼이 끝난 뒤 부른다. */
export function initAds(): Promise<boolean> {
  if (initializing) return initializing;
  const m = adsModule();
  if (!m || (adUnitId('interstitial') === null && adUnitId('rewarded') === null)) return Promise.resolve(false);
  initializing = (async () => {
    const stored = await loadJson<{ lastInterstitialAt: number | null }>(STORAGE_KEYS.adState, { lastInterstitialAt: null });
    useAdStore.setState({ lastInterstitialAt: typeof stored.lastInterstitialAt === 'number' ? stored.lastInterstitialAt : null });
    try {
      notePrivacy(await m.AdsConsent.gatherConsent());
    } catch {
      // 동의 메시지 없음·네트워크 실패: 비맞춤형으로
    }
    nonPersonalized = !(await requestTracking());
    try {
      await m.default().initialize();
    } catch {
      return false;
    }
    interstitial = createAd(m, 'interstitial');
    rewarded = createAd(m, 'rewarded');
    return true;
  })();
  return initializing;
}

/** 깬 뒤 "다음"을 누를 때: 차례이고 불러온 광고가 있으면 띄우고 닫힐 때까지 기다린다. */
export async function maybeShowInterstitial(ctx: { adFree: boolean; totalClears: number }): Promise<void> {
  const m = adsModule();
  const now = Date.now();
  if (!m || !interstitial?.loaded) return;
  if (!shouldShowInterstitial({ ...ctx, lastInterstitialAt: useAdStore.getState().lastInterstitialAt, now })) return;
  const ad = interstitial;
  await new Promise<void>((resolve) => {
    const offs: (() => void)[] = [];
    const done = (): void => {
      offs.forEach((off) => off());
      resolve();
    };
    offs.push(ad.addAdEventListener(m.AdEventType.CLOSED, done));
    offs.push(ad.addAdEventListener(m.AdEventType.ERROR, done));
    ad.show().catch(done);
  });
  useAdStore.setState({ lastInterstitialAt: now });
  void saveJson(STORAGE_KEYS.adState, { lastInterstitialAt: now });
}

/** 보상형 광고. 끝까지 봐서 보상을 받았으면 true. 광고가 없으면 false. */
export async function showRewarded(): Promise<boolean> {
  const m = adsModule();
  if (!m || !rewarded) return false;
  if (!rewarded.loaded) {
    safeLoad(rewarded);
    return false;
  }
  const ad = rewarded;
  return new Promise<boolean>((resolve) => {
    let earned = false;
    const offs: (() => void)[] = [];
    const finish = (): void => {
      offs.forEach((off) => off());
      resolve(earned);
    };
    offs.push(ad.addAdEventListener(m.RewardedAdEventType.EARNED_REWARD, () => (earned = true)));
    offs.push(ad.addAdEventListener(m.AdEventType.CLOSED, finish));
    offs.push(ad.addAdEventListener(m.AdEventType.ERROR, finish));
    ad.show().catch(finish);
  });
}

/** 설정 화면: 유럽 동의를 다시 열 수 있는지. */
export async function refreshAdPrivacyOptions(): Promise<void> {
  const m = adsModule();
  if (!m) return;
  try {
    notePrivacy(await m.AdsConsent.getConsentInfo());
  } catch {
    useAdStore.setState({ privacyOptionsRequired: false });
  }
}

export async function showAdPrivacyOptions(): Promise<void> {
  const m = adsModule();
  if (!m) return;
  try {
    notePrivacy(await m.AdsConsent.showPrivacyOptionsForm());
  } catch {
    // 열 수 없음
  }
}
