// 게임 화면의 팝업: 클리어 결과, 힌트 없음(광고 보기·광고 제거).
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';

import type { CharacterId } from '@/core/chapters';
import { ADFREE_BONUS_HINTS, CONTINUE_HEARTS, REWARDED_HINTS } from '@/core/config';

import { Button } from './Button';
import { charImage } from './characters';
import { Sprite } from './Sprite';
import { playSfx } from './feedback';
import { CHARACTER_THEME, colors, FONT, radius, shadow, space } from './theme';
import { useT } from './useT';

export function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function Star({ on, index }: { on: boolean; index: number }) {
  return (
    <Animated.View entering={ZoomIn.delay(250 + index * 180).springify()}>
      <Ionicons name="star" size={index === 1 ? 54 : 44} color={on ? colors.gold : '#E9E1EF'} style={{ marginTop: index === 1 ? 0 : 12 }} />
    </Animated.View>
  );
}

interface ClearProps {
  visible: boolean;
  character: CharacterId;
  line: string;
  stars: number | null;
  timeMs: number;
  bestMs: number | null;
  newBest: boolean;
  notes: string[];
  primaryLabel: string;
  onPrimary(): void;
  onRetry(): void;
  onList(): void;
  listLabel: string;
  /** 광고 제거 제안(작은 버튼, 조건은 src/core/adPolicy.ts shouldOfferAdFree). 없으면 숨김. */
  offer?: { label: string; onPress(): void } | null;
  /** 이번 클리어로 얻은 마을 소품(그림·문구). 없으면 숨김. */
  reward?: { image: ImageSourcePropType; label: string } | null;
  /** 오늘의 퍼즐 7일 연속 보상 줄(오늘 위치 day는 1~7). */
  streak?: { day: number; rewards: number[]; label: string } | null;
  shareLabel: string;
  onShare(): void;
}

export function ClearSheet(p: ClearProps) {
  const { t } = useT();
  const theme = CHARACTER_THEME[p.character];
  const y = useSharedValue(0);
  useEffect(() => {
    if (!p.visible) return;
    if (p.reward) setTimeout(() => playSfx('reward'), 700);
    y.value = withDelay(200, withRepeat(withSequence(withTiming(-26, { duration: 220 }), withSpring(0, { damping: 7 })), 3, false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.visible, y]);
  const jump = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Modal visible={p.visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View entering={ZoomIn.springify()} style={[styles.card, { borderColor: theme.main }]}>
          <Animated.View style={[styles.charWrap, jump]}>
            <Sprite character={p.character} anim="cheer" size={140} />
          </Animated.View>
          <Text style={styles.clear}>{t('clear')}</Text>
          {p.stars !== null ? (
            <View style={styles.stars}>
              {[0, 1, 2].map((i) => (
                <Star key={i} index={i} on={p.stars! > i} />
              ))}
            </View>
          ) : null}
          <Text style={styles.line}>“{p.line}”</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('time')}</Text>
              <Text style={styles.statValue}>{formatTime(p.timeMs)}</Text>
            </View>
            {p.bestMs !== null ? (
              <View style={styles.stat}>
                <Text style={styles.statLabel}>{t('best')}</Text>
                <Text style={styles.statValue}>{formatTime(p.bestMs)}</Text>
              </View>
            ) : null}
          </View>
          {p.reward ? (
            <Animated.View entering={ZoomIn.delay(700).springify()} style={styles.reward}>
              <Image source={p.reward.image} style={styles.rewardImage} resizeMode="contain" />
              <Text style={styles.rewardText}>{p.reward.label}</Text>
            </Animated.View>
          ) : null}
          {p.newBest ? <Text style={styles.note}>🎉 {t('newBest')}</Text> : null}
          {p.streak ? (
            <View style={styles.streakBox}>
              <Text style={styles.streakLabel}>🔥 {p.streak.label}</Text>
              <View style={styles.streakRow}>
                {p.streak.rewards.map((r, i) => {
                  const done = i < p.streak!.day;
                  const today = i === p.streak!.day - 1;
                  return (
                    <Animated.View
                      key={i}
                      entering={today ? ZoomIn.delay(600).springify() : undefined}
                      style={[styles.streakDot, done && styles.streakDone, today && styles.streakToday, r >= 5 && !done && styles.streakBig]}
                    >
                      <Text style={[styles.streakText, done && { color: colors.white }]}>{done ? '✓' : `+${r}`}</Text>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          ) : null}
          {p.notes.map((n) => (
            <Text key={n} style={styles.note}>
              ✨ {n}
            </Text>
          ))}
          <View style={styles.actions}>
            <Button testID="clear-primary" label={p.primaryLabel} icon="arrow-forward" onPress={p.onPrimary} />
            <View style={styles.row}>
              <Button small label={t('retry')} icon="refresh" color={colors.card} edge={colors.line} textColor={colors.ink} onPress={p.onRetry} style={{ flex: 1 }} />
              <Button small label={p.listLabel} icon="grid" color={colors.card} edge={colors.line} textColor={colors.ink} onPress={p.onList} style={{ flex: 1 }} />
            </View>
            <Button small label={p.shareLabel} icon="share-social" color={colors.gold} edge={colors.goldDark} onPress={p.onShare} />
            {p.offer ? (
              <Pressable accessibilityRole="button" onPress={p.offer.onPress} hitSlop={8} style={styles.offer}>
                <Ionicons name="sparkles" size={15} color={colors.primaryDark} />
                <Text style={styles.offerText}>{p.offer.label}</Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface HintProps {
  visible: boolean;
  character: CharacterId;
  adReady: boolean;
  adBusy: boolean;
  showBuy: boolean;
  price: string | null;
  onWatchAd(): void;
  onBuy(): void;
  onClose(): void;
}

export function NoHintSheet(p: HintProps) {
  const { t } = useT();
  return (
    <Modal visible={p.visible} transparent animationType="fade" onRequestClose={p.onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View entering={ZoomIn.springify()} style={[styles.card, { borderColor: CHARACTER_THEME[p.character].main }]}>
          <Image source={charImage(p.character, 'q')} style={{ width: 110, height: 110 }} resizeMode="contain" />
          <Text style={styles.clear}>{t('noHints')}</Text>
          <View style={styles.actions}>
            <Button
              label={t('watchAd', { n: REWARDED_HINTS })}
              icon="play-circle"
              color={colors.gold}
              edge={colors.goldDark}
              disabled={p.adBusy}
              onPress={p.onWatchAd}
              sub={p.adBusy ? <ActivityIndicator color={colors.white} size="small" /> : null}
            />
            {p.showBuy ? (
              <Button
                label={`${t('removeAds')}${p.price ? ` · ${p.price}` : ''}`}
                icon="sparkles"
                sub={<Text style={styles.sub}>{t('removeAdsDesc', { n: ADFREE_BONUS_HINTS })}</Text>}
                onPress={p.onBuy}
              />
            ) : null}
            <Button small label={t('cancel')} color={colors.card} edge={colors.line} textColor={colors.ink} onPress={p.onClose} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface FailProps {
  visible: boolean;
  character: CharacterId;
  /** 보상형 광고로 이어할 수 있는지(광고가 준비됨). */
  adReady: boolean;
  adBusy: boolean;
  listLabel: string;
  onContinue(): void;
  onRetry(): void;
  onList(): void;
}

/** 하트를 다 쓰고 또 틀렸을 때: 다시 하기 / 광고 보고 이어하기 / 목록. */
export function FailSheet(p: FailProps) {
  const { t } = useT();
  return (
    <Modal visible={p.visible} transparent animationType="fade" onRequestClose={p.onRetry} statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View entering={ZoomIn.springify()} style={[styles.card, { borderColor: CHARACTER_THEME[p.character].main }]}>
          <Image source={charImage(p.character, 'q')} style={{ width: 110, height: 110 }} resizeMode="contain" />
          <Text style={[styles.clear, styles.failTitle]}>{t('outOfChances')}</Text>
          <View style={styles.actions}>
            <Button label={t('retry')} icon="refresh" onPress={p.onRetry} />
            {p.adReady ? (
              <Button
                label={t('continueWithAd', { n: CONTINUE_HEARTS })}
                icon="play-circle"
                color={colors.gold}
                edge={colors.goldDark}
                disabled={p.adBusy}
                onPress={p.onContinue}
                sub={p.adBusy ? <ActivityIndicator color={colors.white} size="small" /> : null}
              />
            ) : null}
            <Button small label={p.listLabel} color={colors.card} edge={colors.line} textColor={colors.ink} onPress={p.onList} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: radius.lg + 4,
    borderWidth: 3,
    alignItems: 'center',
    padding: space.xl,
    paddingTop: space.lg,
    ...shadow,
  },
  charWrap: { marginTop: -100 },
  char: { width: 140, height: 140 },
  clear: { fontFamily: FONT.round, fontSize: 34, color: colors.ink, marginTop: space.md },
  failTitle: { fontSize: 26, textAlign: 'center' },
  stars: { flexDirection: 'row', gap: space.sm, marginVertical: space.sm },
  line: { fontFamily: FONT.round, fontSize: 16, color: colors.inkSoft, textAlign: 'center', marginBottom: space.md },
  statRow: { flexDirection: 'row', gap: space.xl, marginBottom: space.sm },
  stat: { alignItems: 'center' },
  statLabel: { fontFamily: FONT.round, fontSize: 13, color: colors.inkSoft },
  statValue: { fontFamily: FONT.round, fontSize: 24, color: colors.ink },
  note: { fontFamily: FONT.round, fontSize: 15, color: colors.primaryDark, marginTop: 2 },
  actions: { alignSelf: 'stretch', gap: space.sm, marginTop: space.lg },
  row: { flexDirection: 'row', gap: space.sm },
  streakBox: { alignItems: 'center', marginTop: space.sm },
  streakLabel: { fontFamily: FONT.round, fontSize: 13, color: colors.inkSoft, marginBottom: 4 },
  streakRow: { flexDirection: 'row', gap: 5 },
  streakDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  streakDone: { backgroundColor: colors.gold, borderColor: colors.goldDark },
  streakToday: { transform: [{ scale: 1.15 }] },
  streakBig: { borderColor: colors.primary },
  streakText: { fontFamily: FONT.round, fontSize: 12, color: colors.ink },
  reward: { alignItems: 'center', backgroundColor: '#F4FBEF', borderRadius: radius.md, paddingVertical: space.sm, paddingHorizontal: space.lg, marginTop: space.sm },
  rewardImage: { width: 72, height: 72 },
  rewardText: { fontFamily: FONT.round, fontSize: 15, color: '#4E9E70', marginTop: 2 },
  offer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: space.sm },
  offerText: { fontFamily: FONT.round, fontSize: 15, color: colors.primaryDark, textDecorationLine: 'underline' },
  sub: { color: colors.white, fontFamily: FONT.round, fontSize: 12, opacity: 0.9 },
});
