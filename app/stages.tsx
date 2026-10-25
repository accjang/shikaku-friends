// 스테이지 목록: 위에 챕터 탭(캐릭터 얼굴), 아래에 그 챕터 스테이지 칸(별·잠금).
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { CHAPTERS, levelCount, levelId, type Chapter } from '@/core/chapters';
import { CHAPTER_UNLOCK_CLEARS } from '@/core/config';
import { clearedCount, isChapterUnlocked, isLevelUnlocked, nextUnplayed } from '@/core/progress';
import { useProgressStore } from '@/data/progressStore';
import { charImage } from '@/ui/characters';
import { playSfx } from '@/ui/feedback';
import { Screen } from '@/ui/Screen';
import { CHARACTER_THEME, colors, FONT, radius, space } from '@/ui/theme';
import { useT } from '@/ui/useT';

const COLS = 5;

export default function Stages() {
  const { t } = useT();
  const { width } = useWindowDimensions();
  const progress = useProgressStore((s) => s.progress);
  const params = useLocalSearchParams<{ chapter?: string }>();
  const initial = Number(params.chapter) || nextUnplayed(progress)?.chapter || 1;
  const [chapterId, setChapterId] = useState(initial);
  const chapter = CHAPTERS.find((c) => c.id === chapterId) ?? CHAPTERS[0];
  const theme = CHARACTER_THEME[chapter.character];
  const unlocked = isChapterUnlocked(progress, chapter.id);
  const tile = Math.floor((Math.min(width, 520) - space.lg * 2 - space.sm * (COLS - 1)) / COLS);
  const titleKey = `chapterTitle${chapter.id}` as 'chapterTitle1';

  return (
    <Screen title={t('stages')} back>
      <View style={styles.tabs}>
        {CHAPTERS.map((c: Chapter) => {
          const active = c.id === chapter.id;
          const open = isChapterUnlocked(progress, c.id);
          return (
            <Pressable
              key={c.id}
              accessibilityLabel={t('chapter', { n: c.id })}
              onPress={() => {
                playSfx('tap');
                setChapterId(c.id);
              }}
              style={[styles.tab, { backgroundColor: active ? CHARACTER_THEME[c.character].main : colors.card, opacity: open ? 1 : 0.55 }]}
            >
              <Image source={charImage(c.character, 'head')} style={styles.tabHead} />
              <Text style={styles.tabText}>
                {clearedCount(progress, c)}/{levelCount(c)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.banner, { backgroundColor: theme.soft, borderColor: theme.main }]}>
        <Image source={charImage(chapter.character, 'q')} style={styles.bannerChar} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerSmall, { color: theme.dark }]}>{t('chapter', { n: chapter.id })}</Text>
          <Text style={styles.bannerTitle}>{t(titleKey)}</Text>
          {!unlocked ? <Text style={styles.bannerHint}>{t('unlockHint', { n: CHAPTER_UNLOCK_CLEARS })}</Text> : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {Array.from({ length: levelCount(chapter) }, (_, i) => {
          const lv = i + 1;
          const id = levelId(chapter.id, lv);
          const rec = progress.levels[id];
          const open = isLevelUnlocked(progress, chapter.id, lv);
          return (
            <Pressable
              key={id}
              testID={`level-${id}`}
              disabled={!open}
              accessibilityLabel={t('stage', { id })}
              onPress={() => {
                playSfx('tap');
                router.push(`/play/${id}`);
              }}
              style={({ pressed }) => [
                styles.level,
                {
                  width: tile,
                  height: tile + 8,
                  backgroundColor: rec ? theme.main : open ? colors.card : '#EFE7DE',
                  borderColor: rec ? theme.dark : colors.line,
                  transform: [{ scale: pressed ? 0.93 : 1 }],
                },
              ]}
            >
              {open ? (
                <>
                  <Text style={[styles.levelNum, { color: rec ? colors.white : colors.ink }]}>{lv}</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3].map((s) => (
                      <Ionicons key={s} name="star" size={11} color={rec && rec.stars >= s ? colors.gold : 'rgba(75,63,107,0.18)'} />
                    ))}
                  </View>
                </>
              ) : (
                <Ionicons name="lock-closed" size={20} color={colors.inkSoft} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, marginTop: space.sm },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.line,
  },
  tabHead: { width: 44, height: 44 },
  tabText: { fontFamily: FONT.round, color: colors.ink, fontSize: 14, marginTop: 2 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: space.lg,
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: space.md,
  },
  bannerChar: { width: 72, height: 72 },
  bannerSmall: { fontFamily: FONT.round, fontSize: 14 },
  bannerTitle: { fontFamily: FONT.round, fontSize: 22, color: colors.ink },
  bannerHint: { fontFamily: FONT.round, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, padding: space.lg, justifyContent: 'center' },
  level: { borderRadius: radius.md, borderWidth: 2, borderBottomWidth: 5, alignItems: 'center', justifyContent: 'center' },
  levelNum: { fontFamily: FONT.round, fontSize: 22 },
  stars: { flexDirection: 'row', marginTop: 2 },
});
