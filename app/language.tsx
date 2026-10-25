// 언어 고르기(스크롤 목록). 맨 위 "📱 기기 언어"를 고르면 기기 설정을 따른다(설정값 null).
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { LOCALE_NAMES, LOCALES, type Locale } from '@/core/i18n';
import { deviceLocale, useSettingsStore } from '@/data/settingsStore';
import { playSfx } from '@/ui/feedback';
import { loadRoundFont } from '@/ui/fonts';
import { Screen } from '@/ui/Screen';
import { colors, FONT, radius, space } from '@/ui/theme';
import { useT } from '@/ui/useT';

type Item = { key: 'device'; locale: Locale } | { key: Locale; locale: Locale };

export default function LanguageScreen() {
  const { t } = useT();
  const chosen = useSettingsStore((s) => s.locale);
  const patch = useSettingsStore((s) => s.patch);
  const device = deviceLocale();
  const items: Item[] = [{ key: 'device', locale: device }, ...LOCALES.map((l) => ({ key: l, locale: l }))];

  return (
    <Screen title={t('language')} back>
      <FlatList
        data={items}
        keyExtractor={(it) => it.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const on = item.key === 'device' ? chosen === null : chosen === item.key;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                playSfx('tap');
                patch({ locale: item.key === 'device' ? null : item.key });
                void loadRoundFont(item.locale);
                router.back();
              }}
              style={({ pressed }) => [styles.row, on && styles.rowOn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.label, on && { color: colors.white }]}>
                {item.key === 'device' ? `📱 ${LOCALE_NAMES[device]}` : LOCALE_NAMES[item.locale]}
              </Text>
              {on ? <Ionicons name="checkmark" size={20} color={colors.white} /> : <View style={{ width: 20 }} />}
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: space.lg, gap: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.line,
  },
  rowOn: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  label: { fontSize: 17, color: colors.ink, fontFamily: FONT.round },
});
