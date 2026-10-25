// 루트: 글꼴(Jua)·저장소(진행·설정)를 읽는 동안 스플래시 유지 → 스택 내비게이션.
// 첫 실행(튜토리얼 안 함)이면 홈(app/index.tsx)이 /tutorial로 보낸다. 결제는 시작할 때, 광고는 튜토리얼이 끝난 뒤 초기화한다.
import { Jua_400Regular, useFonts } from '@expo-google-fonts/jua';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { hydrateAdState, initAds } from '@/data/ads';
import { useProgressStore } from '@/data/progressStore';
import { initPurchases } from '@/data/purchases';
import { useSettingsStore } from '@/data/settingsStore';
import { colors } from '@/ui/theme';

try {
  void SplashScreen.preventAutoHideAsync().catch(() => undefined);
} catch {
  // 웹·테스트
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Jua_400Regular });
  const progressReady = useProgressStore((s) => s.hydrated);
  const settingsReady = useSettingsStore((s) => s.hydrated);
  const tutorialDone = useProgressStore((s) => s.progress.tutorialDone);
  const ready = (fontsLoaded || fontError !== null) && progressReady && settingsReady;

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
