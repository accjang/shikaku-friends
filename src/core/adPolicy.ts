// 광고 빈도 규칙(UI·SDK 없음). SDK 연결은 src/data/ads.ts.
// - 전면: 스테이지·오늘의 퍼즐을 깬 뒤 결과 화면에서 "다음"을 누를 때. 처음 몇 번은 띄우지 않고, N번마다 한 번, 최소 간격.
// - 보상형: 힌트가 0일 때 사용자가 직접 골라서 볼 때만.
// - 광고 제거를 샀으면 전면은 없다(보상형은 사용자가 원하면 계속 쓸 수 있다).
import { AD_FREE_FIRST_CLEARS, AD_INTERSTITIAL_EVERY, AD_INTERSTITIAL_MIN_GAP_MS } from './config';

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
