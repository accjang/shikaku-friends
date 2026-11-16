// 지난 오늘의 퍼즐 달력: 달마다 날짜 칸(제날에 풂 ✓ 금색 · 나중에 풂 ✓ 옅게 · 안 풂은 눌러서 풀기 · 오늘은 테두리).
// 지난 날을 풀어도 연속 일수·보상에는 들어가지 않는다(src/core/progress.ts recordLateDailyClear).
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { DAILY_EPOCH } from '@/core/config';
import { dateKey, monthWeeks, prevDateKey } from '@/core/daily';
import { dailyStatus, dailyStreak } from '@/core/progress';
import { useProgressStore } from '@/data/progressStore';
import { playSfx } from '@/ui/feedback';
import { Screen } from '@/ui/Screen';
import { colors, FONT, radius, space } from '@/ui/theme';
import { useT } from '@/ui/useT';

const DAYS_IN_WEEK = 7;
/** 요일 머리글을 만들 때 쓰는 일요일(2026-11-01은 일요일). */
const A_SUNDAY = new Date(2026, 10, 1);

function monthTitle(locale: string, year: number, month: number): string {
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(new Date(year, month - 1, 1));
  } catch {
    return `${year}-${String(month).padStart(2, '0')}`;
  }
}

function weekdayNames(locale: string): string[] {
  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => {
    const d = new Date(A_SUNDAY.getFullYear(), A_SUNDAY.getMonth(), A_SUNDAY.getDate() + i);
    try {
      return new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(d);
    } catch {
      return '';
    }
  });
}

export default function DailyArchive() {
  const { t, locale } = useT();
  const { width } = useWindowDimensions();
  const progress = useProgressStore((s) => s.progress);
  const today = dateKey(new Date());
  const [ty, tm] = today.split('-').map(Number);
  const [ey, em] = DAILY_EPOCH.split('-').map(Number);
  const [ym, setYm] = useState({ y: ty, m: tm });
  const weeks = monthWeeks(ym.y, ym.m);
  const cell = Math.floor((Math.min(width, 520) - space.lg * 2 - space.xs * (DAYS_IN_WEEK - 1)) / DAYS_IN_WEEK);
  const canPrev = ym.y > ey || (ym.y === ey && ym.m > em);
  const canNext = ym.y < ty || (ym.y === ty && ym.m < tm);
  const move = (by: number): void => {
    playSfx('tap');
    const d = new Date(ym.y, ym.m - 1 + by, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() + 1 });
  };
  const keys = weeks.flat().filter((k): k is string => k !== null);
  const playable = keys.filter((k) => !['future', 'before'].includes(dailyStatus(progress, k, today)));
  const solved = playable.filter((k) => dailyStatus(progress, k, today) !== 'open').length;
  const streak = dailyStreak(progress, today, prevDateKey);

  return (
    <Screen back title={t('dailyArchive')}>
      <View style={styles.monthRow}>
        <Pressable accessibilityLabel="prev-month" disabled={!canPrev} hitSlop={10} onPress={() => move(-1)} style={[styles.arrow, !canPrev && styles.off]}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={styles.monthMid}>
          <Text style={styles.month}>{monthTitle(locale, ym.y, ym.m)}</Text>
          <Text style={styles.count}>
            ✓ {solved}/{playable.length}
            {streak > 0 ? ` · 🔥 ${t('streak', { n: streak })}` : ''}
          </Text>
        </View>
        <Pressable accessibilityLabel="next-month" disabled={!canNext} hitSlop={10} onPress={() => move(1)} style={[styles.arrow, !canNext && styles.off]}>
          <Ionicons name="chevron-forward" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        <View style={styles.week}>
          {weekdayNames(locale).map((n, i) => (
            <Text key={i} style={[styles.weekday, { width: cell }]}>
              {n}
            </Text>
          ))}
        </View>
        {weeks.map((week, w) => (
          <View key={w} style={styles.week}>
            {week.map((key, i) => {
              if (!key) return <View key={i} style={{ width: cell, height: cell }} />;
              const status = dailyStatus(progress, key, today);
              const locked = status === 'future' || status === 'before';
              const isToday = key === today;
              return (
                <Pressable
                  key={key}
                  accessibilityLabel={`day-${key}`}
                  disabled={locked}
                  onPress={() => {
                    playSfx('tap');
                    router.push(isToday ? '/play/daily' : (`/play/d${key}` as never));
                  }}
                  style={[
                    styles.day,
                    { width: cell, height: cell },
                    status === 'onTime' && styles.onTime,
                    status === 'late' && styles.late,
                    locked && styles.off,
                    isToday && styles.today,
                  ]}
                >
                  <Text style={[styles.dayNum, status === 'onTime' && { color: colors.white }]}>{Number(key.slice(-2))}</Text>
                  {status === 'onTime' || status === 'late' ? (
                    <Ionicons name="checkmark" size={14} color={status === 'onTime' ? colors.white : colors.goldDark} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <Text style={styles.hint}>{t('dailyArchiveHint')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, marginTop: space.md },
  monthMid: { alignItems: 'center' },
  month: { fontFamily: FONT.round, fontSize: 22, color: colors.ink },
  count: { fontFamily: FONT.round, fontSize: 14, color: colors.inkSoft, marginTop: 2 },
  arrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  off: { opacity: 0.35 },
  grid: { alignSelf: 'center', marginTop: space.lg, gap: space.xs },
  week: { flexDirection: 'row', gap: space.xs },
  weekday: { textAlign: 'center', fontFamily: FONT.round, fontSize: 13, color: colors.inkSoft },
  day: {
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onTime: { backgroundColor: colors.gold, borderColor: colors.goldDark },
  late: { backgroundColor: '#FFF4D6', borderColor: colors.gold },
  today: { borderColor: colors.primary, borderWidth: 3 },
  dayNum: { fontFamily: FONT.round, fontSize: 16, color: colors.ink },
  hint: { fontFamily: FONT.round, fontSize: 13, color: colors.inkSoft, textAlign: 'center', marginTop: space.lg, paddingHorizontal: space.xl },
});
