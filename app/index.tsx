// 홈: 제목 + 세 친구(통통 튀며 숨 쉼) + 이어하기·스테이지·오늘의 퍼즐 + 별·힌트 수·설정.
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { levelId, type CharacterId } from '@/core/chapters';
import { dailyStreak, nextUnplayed, starCount } from '@/core/progress';
import { dateKey, prevDateKey } from '@/core/daily';
import { useProgressStore } from '@/data/progressStore';
import { Button } from '@/ui/Button';
import { charImage, type Pose } from '@/ui/characters';
import { playSfx } from '@/ui/feedback';
import { Pill, Screen } from '@/ui/Screen';
import { colors, FONT, RECT_PALETTE, space } from '@/ui/theme';
import { useT } from '@/ui/useT';

function Bouncy({ id, pose, size, delay }: { id: CharacterId; pose: Pose; size: number; delay: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(-10, { duration: 600 }), withTiming(0, { duration: 600 })), -1, true));
  }, [delay, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={style}>
      <Pressable
        onPress={() => {
          playSfx('place');
          y.set(withSequence(withTiming(-40, { duration: 160 }), withTiming(0, { duration: 260 })));
        }}
      >
        <Image source={charImage(id, pose)} style={{ width: size, height: size }} resizeMode="contain" />
      </Pressable>
    </Animated.View>
  );
}

/** 제목 글자마다 파스텔 네모 배경. */
function Logo({ text }: { text: string }) {
  return (
    <View style={styles.logoRow}>
      {[...text].map((ch, i) =>
        ch === ' ' ? (
          <View key={i} style={{ width: 10 }} />
        ) : (
          <View key={i} style={[styles.logoTile, { backgroundColor: RECT_PALETTE[i % RECT_PALETTE.length], transform: [{ rotate: `${i % 2 ? 4 : -4}deg` }] }]}>
            <Text style={styles.logoChar}>{ch}</Text>
          </View>
        ),
      )}
    </View>
  );
}

export default function Home() {
  const { t } = useT();
  const progress = useProgressStore((s) => s.progress);
  if (!progress.tutorialDone) return <Redirect href="/tutorial" />;

  const next = nextUnplayed(progress);
  const today = dateKey(new Date());
  const doneToday = today in progress.daily;
  const streak = dailyStreak(progress, today, prevDateKey);
  const started = Object.keys(progress.levels).length > 0;

  return (
    <Screen>
      <View style={styles.top}>
        <Pill icon="star" text={String(starCount(progress))} />
        <Pill icon="bulb" text={String(progress.hints)} color={colors.primary} />
        <View style={{ flex: 1 }} />
        <Pressable accessibilityLabel={t('settings')} onPress={() => router.push('/settings')} style={styles.gear} hitSlop={8}>
          <Ionicons name="settings-sharp" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Logo text={t('appName')} />
        <Text style={styles.tagline}>{t('tagline')}</Text>
        <View style={styles.friends}>
          <Bouncy id="cat" pose="q" size={118} delay={0} />
          <Bouncy id="panda" pose="front" size={150} delay={200} />
          <Bouncy id="rabbit" pose="ql" size={118} delay={400} />
        </View>
      </View>

      <View style={styles.buttons}>
        <Button
          testID="continue"
          label={started ? t('play') : t('playFirst')}
          icon="play"
          sub={next ? <Text style={styles.sub}>{t('stage', { id: levelId(next.chapter, next.level) })}</Text> : null}
          onPress={() => router.push(next ? `/play/${levelId(next.chapter, next.level)}` : '/stages')}
        />
        <Button label={t('stages')} icon="grid" color={colors.card} edge={colors.line} textColor={colors.ink} onPress={() => router.push('/stages')} />
        <Button
          label={t('daily')}
          icon="calendar"
          color={colors.gold}
          edge={colors.goldDark}
          sub={<Text style={styles.sub}>{doneToday ? `✓ ${t('dailyDone')}` : streak > 0 ? t('streak', { n: streak }) : today}</Text>}
          onPress={() => router.push('/play/daily')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.sm },
  gear: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.line,
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  logoRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 },
  logoTile: { minWidth: 44, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  logoChar: { fontFamily: FONT.round, fontSize: 30, color: colors.ink },
  tagline: { marginTop: space.md, fontFamily: FONT.round, fontSize: 17, color: colors.inkSoft },
  friends: { flexDirection: 'row', alignItems: 'flex-end', marginTop: space.xl },
  buttons: { paddingHorizontal: space.xl, paddingBottom: space.xl, gap: space.md },
  sub: { color: colors.white, fontFamily: FONT.round, fontSize: 13, opacity: 0.9 },
});
