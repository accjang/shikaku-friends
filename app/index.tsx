// 홈: 제목 + 다섯 친구(통통 튀며 숨 쉼) + 이어하기·스테이지·오늘의 퍼즐 + 별·힌트 수·설정.
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { levelId, type CharacterId } from '@/core/chapters';
import { letterTileFriendly, RTL_LOCALES } from '@/core/i18n';
import { PROP_EVERY } from '@/core/config';
import { nextProp, PROP_IDS, stagesCleared, unlockedPropCount } from '@/core/village';
import { dailyStreak, nextUnplayed, starCount, streakReward } from '@/core/progress';
import { dateKey, prevDateKey } from '@/core/daily';
import { useProgressStore } from '@/data/progressStore';
import { Button } from '@/ui/Button';
import { Sprite } from '@/ui/Sprite';
import { propImage } from '@/ui/props';
import { playSfx } from '@/ui/feedback';
import { Pill, Screen } from '@/ui/Screen';
import { colors, FONT, radius, RECT_PALETTE, space } from '@/ui/theme';
import { useT } from '@/ui/useT';

/** 홈 친구들이 옆 친구와 겹치는 정도(다섯 명이 좁은 화면에 들어가게). */
const FRIEND_OVERLAP = 5;

function Bouncy({ id, size, delay }: { id: CharacterId; size: number; delay: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(-10, { duration: 600 }), withTiming(0, { duration: 600 })), -1, true));
  }, [delay, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[{ marginHorizontal: -FRIEND_OVERLAP }, style]}>
      <Pressable
        onPress={() => {
          playSfx('place');
          y.set(withSequence(withTiming(-40, { duration: 160 }), withTiming(0, { duration: 260 })));
        }}
      >
        <Sprite character={id} anim="idle" size={size} offset={delay / 100} />
      </Pressable>
    </Animated.View>
  );
}

/** 제목 글자마다 파스텔 네모 배경. */
/**
 * 제목: 단어마다 한 덩어리(줄바꿈은 단어 사이에서만).
 * 글자를 낱개로 떼어도 되는 문자(한글·가나·한자·라틴·키릴)는 글자마다 파스텔 네모,
 * 글자가 이어지거나 모음 기호가 붙는 문자(아랍·인도계·태국·히브리)는 단어 하나를 네모 하나에.
 * 오른쪽에서 왼쪽으로 읽는 언어는 첫 단어가 오른쪽에 오도록 단어 순서를 뒤집는다.
 */
function Logo({ text, perLetter, rtl }: { text: string; perLetter: boolean; rtl: boolean }) {
  let k = 0;
  const tile = (content: string): React.ReactElement => {
    const i = k++;
    return (
      <View key={i} style={[styles.logoTile, { backgroundColor: RECT_PALETTE[i % RECT_PALETTE.length], transform: [{ rotate: `${i % 2 ? 4 : -4}deg` }] }]}>
        <Text style={styles.logoChar}>{content}</Text>
      </View>
    );
  };
  return (
    <View style={styles.logoRow}>
      {(rtl ? text.split(' ').reverse() : text.split(' ')).map((word, w) => (
        <View key={w} style={styles.logoWord}>
          {perLetter ? [...word.normalize('NFC')].map((ch) => tile(ch)) : tile(word)}
        </View>
      ))}
    </View>
  );
}

export default function Home() {
  const { t, locale } = useT();
  const progress = useProgressStore((s) => s.progress);
  if (!progress.tutorialDone) return <Redirect href="/tutorial" />;

  const next = nextUnplayed(progress);
  const today = dateKey(new Date());
  const doneToday = today in progress.daily;
  const streak = dailyStreak(progress, today, prevDateKey);
  const started = Object.keys(progress.levels).length > 0;
  const cleared = stagesCleared(progress);
  const havePropCount = unlockedPropCount(cleared);
  const nextP = nextProp(cleared);
  // 다음 소품까지 진행률(이번 10개 구간 안에서)
  const villagePct = nextP ? ((PROP_EVERY - nextP.remaining) / PROP_EVERY) * 100 : 100;

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
        <Logo text={t('appName')} perLetter={letterTileFriendly(locale)} rtl={RTL_LOCALES.includes(locale)} />
        <Text style={styles.tagline}>{t('tagline')}</Text>
        <View style={styles.friends}>
          <Bouncy id="duck" size={64} delay={600} />
          <Bouncy id="cat" size={82} delay={0} />
          <Bouncy id="panda" size={114} delay={200} />
          <Bouncy id="rabbit" size={82} delay={400} />
          <Bouncy id="shiba" size={78} delay={800} />
        </View>
      </View>

      <Pressable
        testID="village"
        accessibilityRole="button"
        accessibilityLabel={t('village')}
        onPress={() => {
          playSfx('tap');
          router.push('/village');
        }}
        style={({ pressed }) => [styles.village, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
      >
        <Image source={propImage(nextP?.id ?? 'house')} style={styles.villageImg} resizeMode="contain" />
        <View style={{ flex: 1 }}>
          <Text style={styles.villageTitle}>
            {t('village')} · {havePropCount}/{PROP_IDS.length}
          </Text>
          <Text style={styles.villageSub}>{nextP ? t('villageNext', { n: nextP.remaining }) : t('villageDone')}</Text>
          <View style={styles.villageTrack}>
            <View style={[styles.villageFill, { width: `${villagePct}%` }]} />
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.inkSoft} />
      </Pressable>

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
          sub={
            <Text style={styles.sub}>
              {doneToday
                ? `✓ ${t('dailyDone')}${streak > 1 ? ` · 🔥 ${t('streak', { n: streak })}` : ''}`
                : `${streak > 0 ? `🔥 ${t('streak', { n: streak })} · ` : ''}${t('dailyNext', { n: streakReward(streak + 1) })}`}
            </Text>
          }
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
  logoRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 12, rowGap: 6 },
  logoWord: { flexDirection: 'row', gap: 4 },
  logoTile: { minWidth: 44, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  logoChar: { fontFamily: FONT.round, fontSize: 30, color: colors.ink },
  tagline: { marginTop: space.md, fontFamily: FONT.round, fontSize: 17, color: colors.inkSoft },
  friends: { flexDirection: 'row', alignItems: 'flex-end', marginTop: space.xl },
  village: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.xl,
    marginBottom: space.md,
    padding: space.md,
    backgroundColor: '#EAF6E1',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: '#BFE0AC',
  },
  villageImg: { width: 52, height: 52 },
  villageTitle: { fontFamily: FONT.round, fontSize: 17, color: colors.ink },
  villageSub: { fontFamily: FONT.round, fontSize: 13, color: colors.inkSoft, marginTop: 1 },
  villageTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(75,63,107,0.1)', marginTop: 5, overflow: 'hidden' },
  villageFill: { height: 6, borderRadius: 3, backgroundColor: '#7FCB9C' },
  buttons: { paddingHorizontal: space.xl, paddingBottom: space.xl, gap: space.md },
  sub: { color: colors.white, fontFamily: FONT.round, fontSize: 13, opacity: 0.9 },
});
