// 앱 전체 상수(매직넘버는 여기에만). 광고·결제 키는 .env(EXPO_PUBLIC_*)에서 읽는다 — docs/RELEASE.md 참고.
import type { GenOptions } from './generator';

// ── 생성기 ──
/** 분할을 몇 번 다시 해 볼지. */
export const GEN_PARTITION_RETRIES = 400;
/** 분할 하나에서 숫자 위치를 몇 번 바꿔 볼지. */
export const GEN_CLUE_RETRIES = 30;

// ── 오늘의 퍼즐 ──
export const DAILY_OPTIONS: GenOptions = { w: 8, h: 8, minArea: 2, maxArea: 10, maxSide: 5 };

// ── 진행 ──
/** 다음 챕터를 열려면 앞 챕터에서 깨야 하는 스테이지 수. */
export const CHAPTER_UNLOCK_CLEARS = 20;
/** 처음 주는 힌트 수. */
export const START_HINTS = 3;
/** 오늘의 퍼즐을 깨면 주는 힌트. */
export const DAILY_HINT_REWARD = 1;
/** 보상형 광고 한 번에 주는 힌트. */
export const REWARDED_HINTS = 2;
/** 별: 힌트를 이 수 이하로 썼으면 3개/2개, 그 위는 1개. */
export const STAR_HINT_LIMITS = { three: 0, two: 1 } as const;
/** 되돌리기 기록 최대 길이. */
export const UNDO_LIMIT = 200;

// ── 연출 ──
/** 캐릭터 말풍선이 떠 있는 시간. */
export const BUBBLE_MS = 1800;
/** 완료 후 결과 창을 띄우기까지(축하 연출 시간). */
export const CLEAR_DELAY_MS = 900;

// ── 저장소 ──
export const STORAGE_VERSION = 1;
export const STORAGE_KEYS = {
  progress: 'shikaku.progress',
  settings: 'shikaku.settings',
  adState: 'shikaku.adState',
  mockPurchases: 'shikaku.mockPurchases',
  /** 광고 제거 권리를 한 번이라도 받았는지(보너스 힌트 중복 방지·오프라인 유지). */
  adFreeGranted: 'shikaku.adFreeGranted',
} as const;

// ── 광고(AdMob) ──
/** 설치 후 이 수만큼 스테이지를 깨기 전에는 전면 광고를 띄우지 않는다. */
export const AD_FREE_FIRST_CLEARS = 5;
/** 전면 광고는 N번 깰 때마다 한 번. */
export const AD_INTERSTITIAL_EVERY = 3;
/** 전면 광고 사이 최소 간격. */
export const AD_INTERSTITIAL_MIN_GAP_MS = 3 * 60 * 1000;

// Expo는 process.env.EXPO_PUBLIC_이름 을 글자 그대로 쓴 곳만 빌드 때 값으로 바꾼다(동적 접근 금지).
const env = (value: string | undefined): string => value ?? '';

/** 릴리스 광고 단위 ID(비어 있으면 릴리스에서 광고를 끈다. 개발 빌드는 구글 테스트 ID). */
export const ADMOB_UNIT_IDS = {
  ios: {
    interstitial: env(process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL),
    rewarded: env(process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED),
  },
  android: {
    interstitial: env(process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL),
    rewarded: env(process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED),
  },
} as const;

// ── 결제(RevenueCat) ──
export const REVENUECAT_API_KEY_IOS = env(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS);
export const REVENUECAT_API_KEY_ANDROID = env(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID);
/** App Store Connect·Play Console에 같은 ID로 만든다(비소모성). */
export const PRODUCT_IDS = { adFree: 'shikaku_remove_ads' } as const;
/** RevenueCat 권리(entitlement) ID. */
export const ENTITLEMENT_ADFREE = 'ad_free';
/** 광고 제거를 사면 함께 주는 힌트. */
export const ADFREE_BONUS_HINTS = 10;
/** 개발 빌드 가상 결제 가격 표시(실제 가격은 스토어에서). */
export const MOCK_ADFREE_PRICE = '₩3,900';

// ── 링크(출시 전에 채운다 — docs/RELEASE.md) ──
/** 개인정보처리방침 주소(docs/store/privacy-policy.md를 올린 곳). 비어 있으면 설정에서 줄을 숨긴다. */
export const PRIVACY_POLICY_URL = env(process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL);
/** 문의 메일 주소. 비어 있으면 설정에서 줄을 숨긴다. */
export const SUPPORT_EMAIL = env(process.env.EXPO_PUBLIC_SUPPORT_EMAIL);
