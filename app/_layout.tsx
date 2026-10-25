// 루트: 저장소(진행·설정) → 그 언어에 맞는 둥근 글꼴(Jua 또는 Nunito, src/ui/fonts.ts)을 읽는 동안 스플래시 유지 → 스택 내비게이션.
// 첫 실행(튜토리얼 안 함)이면 홈(app/index.tsx)이 /tutorial로 보낸다. 결제는 시작할 때, 광고는 튜토리얼이 끝난 뒤 초기화한다.
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { hydrateAdState, initAds } from '@/data/ads';
import { useProgressStore } from '@/data/progressStore';
import { initPurchases } from '@/data/purchases';
import { deviceLocale, useSettingsStore } from '@/data/settingsStore';
import { loadRoundFont } from '@/ui/fonts';
import { colors } from '@/ui/theme';

try {
  void SplashScreen.preventAutoHideAsync().catch(() => undefined);
} catch {
  // 웹·테스트
}

export default function RootLayout() {
  const [fontsReady, setFontsReady] = useState(false);
  const progressReady = useProgressStore((s) => s.hydrated);
  const settingsReady = useSettingsStore((s) => s.hydrated);
  const tutorialDone = useProgressStore((s) => s.progress.tutorialDone);
  const ready = fontsReady && progressReady && settingsReady;

  // 글꼴은 저장된 언어(없으면 기기 언어)를 알고 나서 한 번 고른다. 실패해도 시스템 글꼴로 계속.
  useEffect(() => {
    if (!settingsReady) return;
    void loadRoundFont(useSettingsStore.getState().locale ?? deviceLocale()).finally(() => setFontsReady(true));
  }, [settingsReady]);

  useEffect(() => {
    void useProgressStore.getState().hydrate();
    void useSettingsStore.getState().hydrate();
    void hydrateAdState();
  }, []);

  useEffect(() => {
    if (!progressReady) return;
    void initPurchases();
  }, [progressReady]);

  useEffect(() => {
    if (!ready) return;
    try {
      void SplashScreen.hideAsync().catch(() => undefined);
    } catch {
      // 웹·테스트
    }
  }, [ready]);

  useEffect(() => {
    if (ready && tutorialDone) void initAds();
  }, [ready, tutorialDone]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {ready ? (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="tutorial" options={{ animation: 'fade' }} />
            <Stack.Screen name="play/[id]" options={{ gestureEnabled: false }} />
          </Stack>
        ) : null}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
