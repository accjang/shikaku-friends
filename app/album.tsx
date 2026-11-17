// 그림 앨범: 스테이지를 깨며 모은 픽셀아트(캐릭터마다 한 줄). 못 모은 그림은 물음표, 모은 그림은 누르면 크게 본다.
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ALL_PICTURES, collectedPictures, pictureKey, type PictureId } from '@/core/album';
import { CHAPTERS } from '@/core/chapters';
import { PICTURES_PER_CHAPTER } from '@/core/config';
import { useProgressStore } from '@/data/progressStore';
import { charImage } from '@/ui/characters';
import { playSfx } from '@/ui/feedback';
import { postcard } from '@/ui/postcards';
import { Screen } from '@/ui/Screen';
import { CHARACTER_THEME, colors, FONT, radius, space } from '@/ui/theme';
import { useT } from '@/ui/useT';

export default function Album() {
  const { t } = useT();
  const { width } = useWindowDimensions();
  const progress = useProgressStore((s) => s.progress);
  const have = collectedPictures(progress);
  const [open, setOpen] = useState<PictureId | null>(null);
  const inner = Math.min(width, 520) - space.lg * 2;
  const tile = Math.floor((inner - space.sm * (PICTURES_PER_CHAPTER - 1)) / PICTURES_PER_CHAPTER);

  return (
    <Screen back title={t('album')}>
      <Text style={styles.count}>
        🖼 {have.size}/{ALL_PICTURES.length} · {t('albumHint')}
      </Text>
      <ScrollView contentContainerStyle={styles.list}>
        {CHAPTERS.map((ch) => {
          const theme = CHARACTER_THEME[ch.character];
          return (
            <View key={ch.id} style={[styles.rowWrap, { width: inner }]}>
              <Image source={charImage(ch.character, 'head')} style={styles.head} resizeMode="contain" />
              <View style={styles.row}>
                {ALL_PICTURES.filter((p) => p.character === ch.character).map((pic) => {
                  const got = have.has(pictureKey(pic));
                  return (
                    <Pressable
                      key={pic.n}
                      accessibilityLabel={`picture-${pictureKey(pic)}`}
                      disabled={!got}
                      onPress={() => {
                        playSfx('tap');
                        setOpen(pic);
                      }}
                      style={[styles.tile, { width: tile, height: tile, borderColor: got ? theme.main : colors.line, backgroundColor: got ? colors.card : theme.soft }]}
                    >
                      {got ? (
                        <Image source={postcard(pic)} style={styles.fill} resizeMode="cover" />
                      ) : (
                        <Ionicons name="help" size={Math.round(tile * 0.4)} color={theme.main} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={open !== null} transparent animationType="fade" onRequestClose={() => setOpen(null)} statusBarTranslucent>
        <Pressable accessibilityLabel="close-picture" style={styles.overlay} onPress={() => setOpen(null)}>
          {open ? (
            <View style={[styles.big, { width: inner, height: inner, borderColor: CHARACTER_THEME[open.character].main }]}>
              <Image source={postcard(open)} style={styles.fill} resizeMode="cover" />
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: { fontFamily: FONT.round, fontSize: 14, color: colors.inkSoft, textAlign: 'center', marginTop: space.sm, paddingHorizontal: space.lg },
  list: { alignItems: 'center', paddingVertical: space.md, gap: space.md },
  rowWrap: { gap: space.xs },
  head: { width: 36, height: 36 },
  row: { flexDirection: 'row', gap: space.sm },
  tile: { borderRadius: radius.md, borderWidth: 3, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  fill: { width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center' },
  big: { borderRadius: radius.lg, borderWidth: 4, overflow: 'hidden', backgroundColor: colors.card },
});
