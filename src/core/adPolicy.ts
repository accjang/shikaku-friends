// 광고 빈도 규칙(UI·SDK 없음). SDK 연결은 src/data/ads.ts.
// - 전면: 스테이지·오늘의 퍼즐을 깬 뒤 결과 화면에서 "다음"을 누를 때. 처음 몇 번은 띄우지 않고, N번마다 한 번, 최소 간격.
// - 보상형: 힌트가 0일 때 사용자가 직접 골라서 볼 때만.
// - 광고 제거를 샀으면 전면은 없다(보상형은 사용자가 원하면 계속 쓸 수 있다).
// - 광고 제거 제안: 전면 광고를 몇 번 본 사람에게만, 클리어 창의 작은 버튼으로 하루 한 번.
import { AD_FREE_FIRST_CLEARS, AD_FREE_OFFER_AFTER_INTERSTITIALS, AD_INTERSTITIAL_EVERY, AD_INTERSTITIAL_MIN_GAP_MS } from './config';

export interface InterstitialContext {
  adFree: boolean;
  totalClears: number;
  lastInterstitialAt: number | null;
  now: number;
}

export function shouldShowInterstitial(c: InterstitialContext): boolean {
  if (c.adFree) return false;
  if (c.totalClears <= AD_FREE_FIRST_CLEARS) return false;
  if ((c.totalClears - AD_FREE_FIRST_CLEARS) % AD_INTERSTITIAL_EVERY !== 0) return false;
  if (c.lastInterstitialAt !== null && c.now - c.lastInterstitialAt < AD_INTERSTITIAL_MIN_GAP_MS) return false;
  return true;
}

export interface AdFreeOfferContext {
  adFree: boolean;
  /** 결제를 쓸 수 있는지(스토어 연결됨 또는 개발용 가상 결제). */
  canPurchase: boolean;
  interstitialsShown: number;
  /** 마지막으로 제안을 보인 날(YYYY-MM-DD). */
  lastOfferDay: string | null;
  today: string;
}

export function shouldOfferAdFree(c: AdFreeOfferContext): boolean {
  if (c.adFree || !c.canPurchase) return false;
  if (c.interstitialsShown < AD_FREE_OFFER_AFTER_INTERSTITIALS) return false;
  return c.lastOfferDay !== c.today;
}
