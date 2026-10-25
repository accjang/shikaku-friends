// 캐릭터 + 말풍선. 캐릭터는 움직이는 프레임 애니메이션(Sprite), mood가 바뀌면 통통 튀거나(good·clear·hint) 고개를 젓는다(bad).
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { CharacterId } from '@/core/chapters';
import type { Mood } from '@/core/i18n';

import { Sprite } from './Sprite';
import type { AnimName } from './sprites';
import { colors, FONT, shadow } from './theme';

interface Props {
  character: CharacterId;
  mood: Mood;
  /** mood가 같아도 다시 반응하게 하는 번호. */
  beat: number;
  line: string | null;
  size?: number;
  /** idle(평소) 또는 cheer(기뻐하며 춤). */
  anim?: AnimName;
  /** 말풍선 방향: 캐릭터 오른쪽(right) 또는 위(top). */
  bubble?: 'right' | 'top';
}

export function Mascot({ character, mood, beat, line, size = 96, anim = 'idle', bubble = 'right' }: Props) {
  const jump = useSharedValue(0);
  const tilt = useSharedValue(0);

  useEffect(() => {
    if (beat === 0) return;
    if (mood === 'bad') {
      tilt.value = withSequence(
        withTiming(-8, { duration: 70 }),
        withTiming(8, { duration: 110 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 90 }),
      );
    } else {
      const h = mood === 'clear' ? -size * 0.35 : -size * 0.14;
      const times = mood === 'clear' ? 3 : 1;
      jump.value = withRepeat(withSequence(withTiming(h, { duration: 150 }), withSpring(0, { damping: 6, stiffness: 220 })), times, false);
    }
  }, [beat, mood, size, jump, tilt]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: jump.value }, { rotate: `${tilt.value}deg` }],
  }));

  return (
    <View style={[styles.row, bubble === 'top' && { flexDirection: 'column-reverse' }]}>
      <Animated.View style={[{ width: size, height: size }, animStyle]}>
        <Sprite character={character} anim={anim} size={size} />
      </Animated.View>
      {line ? (
        <Animated.View key={`${beat}`} style={[styles.bubble, bubble === 'top' ? styles.bubbleTop : styles.bubbleRight]}>
          <Text style={styles.bubbleText}>{line}</Text>
          <View style={bubble === 'top' ? styles.tailDown : styles.tailLeft} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  bubble: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 230,
    ...shadow,
  },
  bubbleRight: { marginLeft: 12 },
  bubbleTop: { marginBottom: 12 },
  bubbleText: { color: colors.ink, fontFamily: FONT.round, fontSize: 16, lineHeight: 22 },
  tailLeft: {
    position: 'absolute',
    left: -7,
    top: '50%',
    marginTop: -7,
    width: 14,
    height: 14,
    backgroundColor: colors.card,
    transform: [{ rotate: '45deg' }],
  },
  tailDown: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    width: 14,
    height: 14,
    backgroundColor: colors.card,
    transform: [{ rotate: '45deg' }],
  },
});
