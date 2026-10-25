// 웹에 없는 네이티브 SDK를 한곳에서 불러온다. 웹 빌드는 nativeModules.web.ts(전부 null)를 쓴다.
// Expo Go처럼 모듈이 없는 환경에서는 require가 실패하므로 null을 돌려준다.
type AdsModule = typeof import('react-native-google-mobile-ads');
type PurchasesModule = typeof import('react-native-purchases');

export function loadAdsModule(): AdsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-google-mobile-ads') as AdsModule;
  } catch {
    return null;
  }
}

export function loadPurchasesModule(): PurchasesModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-purchases') as PurchasesModule;
  } catch {
    return null;
  }
}
