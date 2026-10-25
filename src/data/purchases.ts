// 결제: "광고 제거" 1회 구매(비소모성)만 판다. RevenueCat(react-native-purchases)으로 App Store·Google Play를 함께 처리한다.
// - 키(EXPO_PUBLIC_REVENUECAT_API_KEY_*)가 있으면 RevenueCat, 없고 개발 빌드면 가상 결제(기기에 저장, 흐름 시험용), 없고 릴리스면 비활성.
// - 권리(ENTITLEMENT_ADFREE)가 활성이면 adFree=true. 처음 켜질 때 보너스 힌트를 한 번 준다.
import { Platform } from 'react-native';
import { create } from 'zustand';

import {
  ADFREE_BONUS_HINTS,
  ENTITLEMENT_ADFREE,
  MOCK_ADFREE_PRICE,
  PRODUCT_IDS,
  REVENUECAT_API_KEY_ANDROID,
  REVENUECAT_API_KEY_IOS,
  STORAGE_KEYS,
} from '@/core/config';
import { addHints } from '@/core/progress';

import { loadPurchasesModule } from './nativeModules';
import { useProgressStore } from './progressStore';
import { loadJson, saveJson } from './storage';

export type PurchaseMode = 'revenuecat' | 'mock' | 'disabled';
export type PurchaseResult = 'success' | 'cancelled' | 'error';

interface PurchaseStore {
  mode: PurchaseMode;
  adFree: boolean;
  /** 스토어 현지화 가격(예: ₩3,900). 모르면 null. */
  price: string | null;
  busy: boolean;
}

export const usePurchaseStore = create<PurchaseStore>()(() => ({ mode: 'disabled', adFree: false, price: null, busy: false }));

const isDev = (): boolean => typeof __DEV__ !== 'undefined' && __DEV__ === true;
const apiKey = (): string => (Platform.OS === 'android' ? REVENUECAT_API_KEY_ANDROID : REVENUECAT_API_KEY_IOS);

export function selectMode(key: string, dev: boolean, os: string): PurchaseMode {
  if (os === 'web') return dev ? 'mock' : 'disabled';
  if (key.trim() !== '') return 'revenuecat';
  return dev ? 'mock' : 'disabled';
}

type RC = typeof import('react-native-purchases').default;
let rc: RC | null = null;

/** 권리 상태 반영. 처음 켜지면(저장된 값이 false였으면) 보너스 힌트. */
async function applyAdFree(adFree: boolean): Promise<void> {
  const before = await loadJson<boolean>(STORAGE_KEYS.adFreeGranted, false);
  usePurchaseStore.setState({ adFree });
  if (adFree && !before) {
    useProgressStore.getState().update((p) => addHints(p, ADFREE_BONUS_HINTS));
    await saveJson(STORAGE_KEYS.adFreeGranted, true);
  }
}

function activeFrom(info: { entitlements: { active: Record<string, unknown> } }): boolean {
  return ENTITLEMENT_ADFREE in info.entitlements.active;
}

export async function initPurchases(): Promise<void> {
  const mode = selectMode(apiKey(), isDev(), Platform.OS);
  usePurchaseStore.setState({ mode });
  if (mode === 'mock') {
    usePurchaseStore.setState({ price: MOCK_ADFREE_PRICE });
    await applyAdFree(await loadJson<boolean>(STORAGE_KEYS.mockPurchases, false));
    return;
  }
  if (mode !== 'revenuecat') {
    // 결제가 없어도 이미 받은 권리는 유지(오프라인 등)
    usePurchaseStore.setState({ adFree: await loadJson<boolean>(STORAGE_KEYS.adFreeGranted, false) });
    return;
  }
  try {
    rc = loadPurchasesModule()?.default ?? null;
    if (!rc) return;
    rc.configure({ apiKey: apiKey() });
    rc.addCustomerInfoUpdateListener((info) => void applyAdFree(activeFrom(info)));
    await applyAdFree(activeFrom(await rc.getCustomerInfo()));
    const [product] = await rc.getProducts([PRODUCT_IDS.adFree], rc.PRODUCT_CATEGORY.NON_SUBSCRIPTION);
    usePurchaseStore.setState({ price: product?.priceString ?? null });
  } catch {
    // 스토어 연결 실패: 다음 실행 때 다시
  }
}

export async function buyAdFree(): Promise<PurchaseResult> {
  const { mode } = usePurchaseStore.getState();
  usePurchaseStore.setState({ busy: true });
  try {
    if (mode === 'mock') {
      await saveJson(STORAGE_KEYS.mockPurchases, true);
      await applyAdFree(true);
      return 'success';
    }
    if (mode !== 'revenuecat' || !rc) return 'error';
    const [product] = await rc.getProducts([PRODUCT_IDS.adFree], rc.PRODUCT_CATEGORY.NON_SUBSCRIPTION);
    if (!product) return 'error';
    const { customerInfo } = await rc.purchaseStoreProduct(product);
    await applyAdFree(activeFrom(customerInfo));
    return activeFrom(customerInfo) ? 'success' : 'error';
  } catch (e) {
    return (e as { userCancelled?: boolean | null })?.userCancelled ? 'cancelled' : 'error';
  } finally {
    usePurchaseStore.setState({ busy: false });
  }
}

/** 구매 복원. 권리가 있으면 true. */
export async function restorePurchases(): Promise<boolean> {
  const { mode } = usePurchaseStore.getState();
  usePurchaseStore.setState({ busy: true });
  try {
    if (mode === 'mock') {
      const owned = await loadJson<boolean>(STORAGE_KEYS.mockPurchases, false);
      await applyAdFree(owned);
      return owned;
    }
    if (mode !== 'revenuecat' || !rc) return false;
    const info = await rc.restorePurchases();
    await applyAdFree(activeFrom(info));
    return activeFrom(info);
  } catch {
    return false;
  } finally {
    usePurchaseStore.setState({ busy: false });
  }
}
