// 클리어 축하 연출(화면 위에 겹침, 터치는 통과): 판 가운데서 색종이가 터지고, 아래에서 별 풍선이 떠올라 하나씩 "뻥" 터진다.
// active가 true가 되는 순간 한 번 재생한다. 소리는 풍선이 터질 때마다 pop.
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import {
  BALLOON_COUNT,
  BALLOON_RISE_MS,
  BALLOON_STAGGER_MS,
  CONFETTI_COUNT,
  CONFETTI_MS,
} from '@/core/config';
import { mulberry32 } from '@/core/random';

import { buzz, playSfx } from './feedback';
import { RECT_PALETTE, RECT_PALETTE_EDGE } from './theme';

interface Piece {
  vx: number;
  vy: number;
  spin: number;
  size: number;
  color: string;
  shape: 'square' | 'circle' | 'star';
}

function Confetti({ piece, progress, originX, originY }: { piece: Piece; progress: SharedValue<number>; originX: number; originY: number }) {
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    // 처음엔 빠르게 퍼지고 중력으로 떨어진다
    const x = piece.vx * p;
    const y = piece.vy * p + 900 * p * p;
    return {
      opacity: p <= 0 ? 0 : p > 0.75 ? (1 - p) / 0.25 : 1,
      transform: [{ translateX: originX + x }, { translateY: originY + y }, { rotate: `${piece.spin * p}deg` }],
    };
  });
  if (piece.shape === 'star') {
    return (
      <Animated.Text style={[styles.piece, { fontSize: piece.size * 1.6, color: piece.color }, style]}>★</Animated.Text>
    );
  }
  return (
    <Animated.View
      style={[
        styles.piece,
        { width: piece.size, height: piece.size * (piece.shape === 'square' ? 0.6 : 1), borderRadius: piece.shape === 'circle' ? piece.size : 2, backgroundColor: piece.color },
        style,
      ]}
    />
  );
}

function Balloon({ index, x, height, color, edge, run }: { index: number; x: number; height: number; color: string; edge: string; run: number }) {
  const rise = useSharedValue(0);
  const burst = useSharedValue(0);
  const popAt = 0.45 + ((index * 37) % 30) / 100; // 화면 높이의 45~75% 지점에서 터짐
  useEffect(() => {
    if (run === 0) return;
    const delay = index * BALLOON_STAGGER_MS;
    rise.value = 0;
    burst.value = 0;
    rise.value = withDelay(delay, withTiming(1, { duration: BALLOON_RISE_MS, easing: Easing.out(Easing.quad) }));
    burst.value = withDelay(delay + BALLOON_RISE_MS, withTiming(1, { duration: 220 }));
    const t = setTimeout(() => {
      playSfx('pop');
      buzz('light');
    }, delay + BALLOON_RISE_MS);
    return () => clearTimeout(t);
  }, [run, index, rise, burst]);

  const body = useAnimatedStyle(() => ({
    opacity: rise.value === 0 ? 0 : 1 - burst.value,
    transform: [
      { translateY: height - rise.value * height * popAt },
      { translateX: Math.sin(rise.value * 6 + index) * 10 },
      { scale: 1 + burst.value * 0.8 },
    ],
  }));
  const sparks = useAnimatedStyle(() => ({
    opacity: burst.value > 0 && burst.value < 1 ? 1 - burst.value : 0,
    transform: [{ translateY: height - height * popAt - 10 }, { scale: 0.6 + burst.value * 1.6 }],
  }));
  return (
    <View pointerEvents="none" style={[styles.lane, { left: x - 28 }]}>
      <Animated.View style={[styles.balloonWrap, body]}>
        <View style={[styles.balloon, { backgroundColor: color, borderColor: edge }]}>
          <Text style={styles.balloonStar}>★</Text>
        </View>
        <View style={[styles.knot, { borderBottomColor: edge }]} />
        <View style={styles.string} />
      </Animated.View>
      <Animated.Text style={[styles.sparks, { color: edge }, sparks]}>✦ ✧ ✦</Animated.Text>
    </View>
  );
}

export function Celebration({ active }: { active: boolean }) {
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);
  const run = active ? 1 : 0;

  const pieces = useMemo<Piece[]>(() => {
    const rng = mulberry32(42);
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
      const angle = rng() * Math.PI * 2;
      const speed = 220 + rng() * 380;
      return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 420,
        spin: (rng() - 0.5) * 900,
        size: 8 + rng() * 8,
        color: RECT_PALETTE_EDGE[i % RECT_PALETTE_EDGE.length],
        shape: i % 5 === 0 ? 'star' : i % 2 === 0 ? 'square' : 'circle',
      };
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    progress.value = 0;
    progress.value = withSequence(withTiming(0.001, { duration: 1 }), withTiming(1, { duration: CONFETTI_MS, easing: Easing.linear }));
  }, [active, progress]);

  if (!active) return null;
  const originX = width / 2;
  const originY = height * 0.45;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: BALLOON_COUNT }, (_, i) => (
        <Balloon
          key={`b${i}`}
          index={i}
          run={run}
          x={((i + 0.5) / BALLOON_COUNT) * width}
          height={height}
          color={RECT_PALETTE[(i * 3) % RECT_PALETTE.length]}
          edge={RECT_PALETTE_EDGE[(i * 3) % RECT_PALETTE_EDGE.length]}
        />
      ))}
      {pieces.map((p, i) => (
        <Confetti key={i} piece={p} progress={progress} originX={originX} originY={originY} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lane: { position: 'absolute', top: 0, bottom: 0, width: 56 },
  piece: { position: 'absolute', left: 0, top: 0 },
  balloonWrap: { position: 'absolute', top: 0, left: 0, width: 56, alignItems: 'center' },
  balloon: {
    width: 52,
    height: 62,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balloonStar: { color: 'white', fontSize: 24, marginTop: -4 },
  knot: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },
  string: { width: 1.5, height: 40, backgroundColor: 'rgba(75,63,107,0.35)' },
  sparks: { position: 'absolute', top: 0, left: -12, width: 80, textAlign: 'center', fontSize: 22, fontWeight: '700' },
});
