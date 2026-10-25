// 시카쿠 판. 칸을 드래그하면 네모 미리보기 → 손을 떼면 놓는다. 네모를 탭하면 지운다. 빈 칸을 탭하면 1칸 네모.
// 규칙 판정은 src/core/puzzle.ts, 상태 변경은 부모(onPlace·onRemove)가 한다.
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';

import { RECT_WAVE_STEP_MS } from '@/core/config';

import { area, contains, rectAt, rectFromCorners, validClueIndex, type Puzzle, type Rect } from '@/core/puzzle';

import { colors, FONT, RECT_PALETTE, RECT_PALETTE_EDGE } from './theme';

interface Props {
  puzzle: Puzzle;
  rects: readonly Rect[];
  cell: number;
  disabled?: boolean;
  onPlace(r: Rect): void;
  onRemove(x: number, y: number): void;
  /** 드래그 중 칸이 바뀔 때(가벼운 진동 등). */
  onDragStep?(): void;
  /** 다 풀었을 때 네모들이 차례로 통통 튄다. */
  celebrate?: boolean;
}

/** 놓은 네모 하나. 놓을 때 커지며 나타나고, wave ≥ 0이면 (wave번째 순서로) 한 번 튄다. */
function WaveRect({ wave, style }: { wave: number; style: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (wave < 0) return;
    scale.value = withDelay(wave * RECT_WAVE_STEP_MS, withSequence(withTiming(1.12, { duration: 140 }), withSpring(1, { damping: 6, stiffness: 260 })));
  }, [wave, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View entering={ZoomIn.duration(160)} style={[style, anim]} />;
}

const GAP = 2;

export function Board({ puzzle, rects, cell, disabled, onPlace, onRemove, onDragStep, celebrate }: Props) {
  const W = puzzle.w * cell;
  const H = puzzle.h * cell;
  const [preview, setPreview] = useState<Rect | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);

  const toCell = (px: number, py: number): { x: number; y: number } => ({
    x: Math.max(0, Math.min(puzzle.w - 1, Math.floor(px / cell))),
    y: Math.max(0, Math.min(puzzle.h - 1, Math.floor(py / cell))),
  });

  // 제스처 콜백은 렌더 중이 아니라 터치 이벤트 때만 불리므로 ref를 읽어도 된다(react-hooks/refs 오탐).
  /* eslint-disable react-hooks/refs */
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .minDistance(0)
        .maxPointers(1)
        .enabled(!disabled)
        .onBegin((e) => {
          const c = toCell(e.x, e.y);
          start.current = c;
          last.current = c;
          setPreview(rectFromCorners(c.x, c.y, c.x, c.y));
        })
        .onUpdate((e) => {
          const s = start.current;
          if (!s) return;
          const c = toCell(e.x, e.y);
          if (last.current && last.current.x === c.x && last.current.y === c.y) return;
          last.current = c;
          setPreview(rectFromCorners(s.x, s.y, c.x, c.y));
          onDragStep?.();
        })
        .onFinalize(() => {
          const s = start.current;
          const c = last.current;
          start.current = null;
          last.current = null;
          setPreview(null);
          if (!s || !c) return;
          if (s.x === c.x && s.y === c.y && rectAt(rects, s.x, s.y) >= 0) {
            onRemove(s.x, s.y);
            return;
          }
          onPlace(rectFromCorners(s.x, s.y, c.x, c.y));
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cell, disabled, puzzle, rects, onPlace, onRemove, onDragStep],
  );
  /* eslint-enable react-hooks/refs */

  const previewValid = preview ? validClueIndex(puzzle, preview) >= 0 : false;
  const fontSize = Math.max(13, Math.round(cell * 0.46));

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.board, { width: W + 8, height: H + 8 }]} accessibilityLabel="board">
        <View style={{ width: W, height: H }}>
          {/* 바탕 칸 */}
          {Array.from({ length: puzzle.h }, (_, y) => (
            <View key={`r${y}`} style={{ flexDirection: 'row' }}>
              {Array.from({ length: puzzle.w }, (_, x) => (
                <View key={x} style={[styles.cell, { width: cell, height: cell }]} />
              ))}
            </View>
          ))}

          {/* 놓은 네모 */}
          {rects.map((r, i) => {
            const ci = validClueIndex(puzzle, r);
            const ok = ci >= 0;
            return (
              <WaveRect
                key={`${r.x},${r.y},${r.w},${r.h}`}
                wave={celebrate ? i : -1}
                style={[
                  styles.rect,
                  {
                    left: r.x * cell + GAP,
                    top: r.y * cell + GAP,
                    width: r.w * cell - GAP * 2,
                    height: r.h * cell - GAP * 2,
                    borderRadius: Math.min(cell * 0.28, 14),
                    backgroundColor: ok ? RECT_PALETTE[ci % RECT_PALETTE.length] : colors.bad,
                    borderColor: ok ? RECT_PALETTE_EDGE[ci % RECT_PALETTE_EDGE.length] : colors.badLine,
                    borderStyle: ok ? 'solid' : 'dashed',
                  },
                ]}
              />
            );
          })}

          {/* 드래그 미리보기 */}
          {preview ? (
            <View
              pointerEvents="none"
              style={[
                styles.preview,
                {
                  left: preview.x * cell,
                  top: preview.y * cell,
                  width: preview.w * cell,
                  height: preview.h * cell,
                  borderRadius: Math.min(cell * 0.28, 14),
                  borderColor: previewValid ? '#5CC28A' : colors.primary,
                  backgroundColor: previewValid ? 'rgba(92,194,138,0.18)' : 'rgba(255,127,163,0.14)',
                },
              ]}
            >
              <View style={[styles.sizeTag, { backgroundColor: previewValid ? '#5CC28A' : colors.primary }]}>
                <Text style={styles.sizeText}>
                  {preview.w}×{preview.h}={area(preview)}
                </Text>
              </View>
            </View>
          ) : null}

          {/* 숫자 */}
          {puzzle.clues.map((c, i) => {
            const covered = rects.some((r) => contains(r, c.x, c.y));
            return (
              <View
                key={`c${i}`}
                pointerEvents="none"
                style={[styles.clueWrap, { left: c.x * cell, top: c.y * cell, width: cell, height: cell }]}
              >
                <View
                  style={[
                    styles.clue,
                    {
                      width: cell * 0.74,
                      height: cell * 0.74,
                      borderRadius: cell * 0.37,
                      backgroundColor: covered ? 'rgba(255,255,255,0.75)' : colors.white,
                    },
                  ]}
                >
                  <Text style={[styles.clueText, { fontSize, lineHeight: fontSize * 1.15 }]}>{c.n}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  board: {
    padding: 4,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.line,
  },
  cell: {
    backgroundColor: colors.cell,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.cellLine,
  },
  rect: { position: 'absolute', borderWidth: 2.5 },
  preview: { position: 'absolute', borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  sizeTag: { position: 'absolute', top: -26, alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  sizeText: { color: colors.white, fontFamily: FONT.round, fontSize: 14 },
  clueWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  clue: { alignItems: 'center', justifyContent: 'center' },
  clueText: { color: colors.ink, fontFamily: FONT.round, textAlign: 'center' },
});
