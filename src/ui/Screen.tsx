// 화면 틀: 안전 영역 + 크림 바탕 + (선택) 뒤로 가기 머리줄.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { playSfx } from './feedback';
import { colors, FONT, space } from './theme';

interface Props {
  title?: string;
  back?: boolean;
  right?: ReactNode;
  children: ReactNode;
  bg?: string;
}

export function Screen({ title, back, right, children, bg = colors.bg }: Props) {
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]} edges={['top', 'bottom', 'left', 'right']}>
      {title !== undefined || back ? (
        <View style={styles.header}>
          <View style={styles.side}>
            {back ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="back"
                hitSlop={12}
                onPress={() => {
                  playSfx('tap');
                  if (router.canGoBack()) router.back();
                  else router.replace('/');
                }}
                style={styles.backBtn}
              >
                <Ionicons name="chevron-back" size={26} color={colors.ink} />
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
        </View>
      ) : null}
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, height: 52 },
  side: { width: 96, justifyContent: 'center' },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.line,
  },
  title: { flex: 1, textAlign: 'center', color: colors.ink, fontFamily: FONT.round, fontSize: 22 },
});

/** 작은 알약 모양 정보(별 수·힌트 수 등). */
export function Pill({ icon, text, color = colors.gold }: { icon: keyof typeof Ionicons.glyphMap; text: string; color?: string }) {
  return (
    <View style={pill.wrap}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={pill.text}>{text}</Text>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: colors.line,
    gap: 4,
  },
  text: { color: colors.ink, fontFamily: FONT.round, fontSize: 15 },
});
