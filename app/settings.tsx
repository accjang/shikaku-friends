// 설정: 효과음·진동·언어, 광고 제거·구매 복원, 게임 방법, 개인정보처리방침·광고 개인정보 옵션·문의, 버전.
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { ADFREE_BONUS_HINTS, PRIVACY_POLICY_URL, SUPPORT_EMAIL } from '@/core/config';
import { LOCALE_NAMES } from '@/core/i18n';
import { refreshAdPrivacyOptions, showAdPrivacyOptions, useAdStore } from '@/data/ads';
import { buyAdFree, restorePurchases, usePurchaseStore } from '@/data/purchases';
import { useSettingsStore } from '@/data/settingsStore';
import { playSfx } from '@/ui/feedback';
import { Screen } from '@/ui/Screen';
import { colors, FONT, radius, space } from '@/ui/theme';
import { useLocale, useT } from '@/ui/useT';

function Row({ icon, label, right, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; right?: React.ReactNode; onPress?(): void }) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={() => {
        playSfx('tap');
        onPress?.();
      }}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name={icon} size={20} color={colors.inkSoft} />
      <Text style={styles.rowLabel}>{label}</Text>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.inkSoft} /> : null)}
    </Pressable>
  );
}

export default function Settings() {
  const { t } = useT();
  const locale = useLocale();
  const chosenLocale = useSettingsStore((st) => st.locale);
  const { sound, haptics, patch } = useSettingsStore();
  const { adFree, mode, price, busy } = usePurchaseStore();
  const privacyOptions = useAdStore((s) => s.privacyOptionsRequired);

  useEffect(() => {
    void refreshAdPrivacyOptions();
  }, []);

  return (
    <Screen title={t('settings')} back>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Row icon="musical-notes" label={t('sound')} right={<Switch value={sound} onValueChange={(v) => patch({ sound: v })} trackColor={{ true: colors.primary }} />} />
          <Row icon="phone-portrait" label={t('haptics')} right={<Switch value={haptics} onValueChange={(v) => patch({ haptics: v })} trackColor={{ true: colors.primary }} />} />
        </View>

        <View style={styles.card}>
          <Row
            icon="language"
            label={t('language')}
            onPress={() => router.push('/language')}
            right={
              <View style={styles.langRight}>
                <Text style={styles.langValue}>
                  {chosenLocale === null ? '📱 ' : ''}
                  {LOCALE_NAMES[locale]}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.inkSoft} />
              </View>
            }
          />
        </View>

        {mode !== 'disabled' ? (
          <View style={styles.card}>
            {adFree ? (
              <Row icon="checkmark-circle" label={t('adFreeOn')} />
            ) : (
              <Row
                icon="sparkles"
                label={`${t('removeAds')}${price ? ` · ${price}` : ''}`}
                onPress={
                  busy
                    ? undefined
                    : async () => {
                        const r = await buyAdFree();
                        if (r === 'success') Alert.alert(t('purchased'), t('removeAdsDesc', { n: ADFREE_BONUS_HINTS }));
                        else if (r === 'error') Alert.alert(t('purchaseFailed'));
                      }
                }
              />
            )}
            <Row
              icon="refresh"
              label={t('restore')}
              onPress={
                busy
                  ? undefined
                  : async () => {
                      const ok = await restorePurchases();
                      Alert.alert(ok ? t('restored') : t('nothingToRestore'));
                    }
              }
            />
          </View>
        ) : null}

        <View style={styles.card}>
          <Row icon="help-circle" label={t('howTo')} onPress={() => router.push('/tutorial')} />
          {PRIVACY_POLICY_URL ? <Row icon="shield-checkmark" label={t('privacy')} onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)} /> : null}
          {privacyOptions ? <Row icon="options" label={t('adPrivacy')} onPress={() => void showAdPrivacyOptions()} /> : null}
          {SUPPORT_EMAIL ? <Row icon="mail" label={t('contact')} onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} /> : null}
        </View>

        <Text style={styles.version}>{t('version', { v: Constants.expoConfig?.version ?? '1.0.0' })}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.md },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, minHeight: 56, gap: space.md },
  rowLabel: { flex: 1, fontFamily: FONT.round, fontSize: 17, color: colors.ink },
  section: { fontFamily: FONT.round, fontSize: 15, color: colors.inkSoft, marginLeft: space.sm, marginBottom: -space.xs },
  langRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  langValue: { fontFamily: FONT.round, fontSize: 15, color: colors.inkSoft },
  version: { textAlign: 'center', fontFamily: FONT.round, color: colors.inkSoft, marginTop: space.md },
});
