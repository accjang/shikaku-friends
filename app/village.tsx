// 마을 꾸미기: 스테이지 10개마다 얻은 술래잡기 소품과, 챕터가 열린 친구들이 모여 사는 장면.
// 아직 못 얻은 소품은 흐린 그림자로 보이고, 누르면 언제 생기는지 알려 준다. 친구·소품을 누르면 통통 튄다.
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import type { CharacterId } from '@/core/chapters';
import { PROP_EVERY } from '@/core/config';
import { CHARACTER_NAMES, characterLine, PROP_NAMES } from '@/core/i18n';
import { nextProp, PROP_IDS, stagesCleared, unlockedPropCount, villageFriends, type PropId } from '@/core/village';
import { useProgressStore } from '@/data/progressStore';
import { charImage } from '@/ui/characters';
import { buzz, playSfx } from '@/ui/feedback';
import { propImage } from '@/ui/props';
import { Screen } from '@/ui/Screen';
import { colors, FONT, radius, shadow, space } from '@/ui/theme';
import { useT } from '@/ui/useT';
import { FRIEND_SPOTS, GROUND_TOP, POND, PROP_SPOTS, type Spot } from '@/ui/villageLayout';

const SCENE_RATIO = 1.25;
const MAX_SCENE_WIDTH = 520;

/** 눌렀을 때 통통 튀는 그림 하나. */
function Bouncer({ spot, size, onPress, children }: { spot: Spot; size: { w: number; h: number }; onPress(): void; children: React.ReactNode }) {
  const y = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const px = spot.h * size.h;
  return (
    <Animated.View style={[styles.item, { left: spot.x * size.w - px / 2, top: spot.y * size.h - px, width: px, height: px }, style]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          y.set(withSequence(withTiming(-px * 0.18, { duration: 120 }), withSpring(0, { damping: 6, stiffness: 240 })));
          onPress();
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function Village() {
  const { t, locale } = useT();
  const { width } = useWindowDimensions();
  const progress = useProgressStore((s) => s.progress);
  const cleared = stagesCleared(progress);
  const have = unlockedPropCount(cleared);
  const next = nextProp(cleared);
  const friends = villageFriends(progress);
  const [message, setMessage] = useState<string | null>(null);
  const [beat, setBeat] = useState(0);

  const sw = Math.min(width - space.lg * 2, MAX_SCENE_WIDTH);
  const size = { w: sw, h: sw * SCENE_RATIO };

  // 그리는 순서: 뒤(y 작은 것)부터
  type Item = { kind: 'prop'; id: PropId; spot: Spot; owned: boolean; order: number } | { kind: 'friend'; id: CharacterId; spot: Spot };
  const items: Item[] = [
    ...PROP_IDS.map((id, order) => ({ kind: 'prop' as const, id, spot: PROP_SPOTS[id], owned: order < have, order })),
    ...friends.map((id) => ({ kind: 'friend' as const, id, spot: FRIEND_SPOTS[id] })),
  ].sort((a, b) => a.spot.y - b.spot.y);

  const say = (text: string): void => {
    setMessage(text);
    setBeat((b) => b + 1);
  };

  return (
    <Screen title={t('villageTitle')} back>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusRow}>
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              🏡 {have}/{PROP_IDS.length}
            </Text>
          </View>
          <Text style={styles.next} numberOfLines={2}>
            {next ? t('villageNext', { n: next.remaining }) : t('villageDone')}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(have / PROP_IDS.length) * 100}%` }]} />
        </View>

        <View style={[styles.scene, { width: size.w, height: size.h }]}>
          <View style={[styles.sky, { height: size.h * (GROUND_TOP + 0.06) }]}>
            <Text style={[styles.cloud, { left: size.w * 0.08, top: size.h * 0.05 }]}>☁️</Text>
            <Text style={[styles.cloud, { left: size.w * 0.62, top: size.h * 0.1, fontSize: 30 }]}>☁️</Text>
          </View>
          <View style={[styles.ground, { top: size.h * GROUND_TOP, height: size.h * (1 - GROUND_TOP) }]} />
          <View
            style={[
              styles.pond,
              {
                left: (POND.x - POND.w / 2) * size.w,
                top: (POND.y - POND.h / 2) * size.h,
                width: POND.w * size.w,
                height: POND.h * size.h,
                borderRadius: POND.w * size.w,
              },
            ]}
          />
          {items.map((it) =>
            it.kind === 'prop' ? (
              <Bouncer
                key={it.id}
                spot={it.spot}
                size={size}
                onPress={() => {
                  if (it.owned) {
                    playSfx('place');
                    buzz('light');
                    say(PROP_NAMES[it.id][locale]);
                  } else {
                    playSfx('tap');
                    say(t('villageLocked', { n: (it.order + 1) * PROP_EVERY }));
                  }
                }}
              >
                <Image
                  source={propImage(it.id)}
                  style={[styles.fillImg, !it.owned && styles.ghost]}
                  tintColor={it.owned ? undefined : '#7FAE6E'}
                  resizeMode="contain"
                />
              </Bouncer>
            ) : (
              <Bouncer
                key={it.id}
                spot={it.spot}
                size={size}
                onPress={() => {
                  playSfx('place');
                  buzz('light');
                  say(`${CHARACTER_NAMES[it.id][locale]}: ${characterLine(it.id, locale, 'good', beat + it.id.length)}`);
                }}
              >
                <Image source={charImage(it.id, 'front')} style={styles.fillImg} resizeMode="contain" />
              </Bouncer>
            ),
          )}
        </View>

        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message ?? t('villageTap')}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: space.xl },
  statusRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: space.md, marginTop: space.xs },
  counter: { backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 2, borderColor: colors.line },
  counterText: { fontFamily: FONT.round, fontSize: 16, color: colors.ink },
  next: { flex: 1, fontFamily: FONT.round, fontSize: 15, color: colors.inkSoft },
  track: { alignSelf: 'stretch', height: 10, borderRadius: 5, backgroundColor: 'rgba(75,63,107,0.1)', marginTop: space.sm, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: '#7FCB9C' },
  scene: { marginTop: space.md, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 3, borderColor: '#CFE8C2', ...shadow },
  sky: { position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: '#CFEAFB' },
  cloud: { position: 'absolute', fontSize: 38, opacity: 0.9 },
  ground: { position: 'absolute', left: 0, right: 0, backgroundColor: '#B9E3A0', borderTopLeftRadius: 60, borderTopRightRadius: 60 },
  pond: { position: 'absolute', backgroundColor: '#9FD8F2', borderWidth: 3, borderColor: '#7EC4E6' },
  item: { position: 'absolute' },
  fillImg: { width: '100%', height: '100%' },
  ghost: { opacity: 0.22 },
  bubble: { marginTop: space.md, backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: space.lg, paddingVertical: space.md, alignSelf: 'stretch', ...shadow },
  bubbleText: { fontFamily: FONT.round, fontSize: 16, color: colors.ink, textAlign: 'center' },
});
