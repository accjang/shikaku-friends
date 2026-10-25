// 통통한 버튼(누르면 살짝 들어간다).
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { buzz, playSfx } from './feedback';
import { colors, FONT, radius, space } from './theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  label: string;
  onPress(): void;
  icon?: IconName;
  color?: string;
  edge?: string;
  textColor?: string;
  sub?: ReactNode;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({ label, onPress, icon, color = colors.primary, edge = colors.primaryDark, textColor = colors.white, sub, disabled, small, style, testID }: Props) {
  const h = small ? 46 : 58;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        playSfx('tap');
        buzz('light');
        onPress();
      }}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      {({ pressed }) => (
        <View style={[styles.edge, { backgroundColor: edge, height: h + 5, borderRadius: radius.lg }]}>
          <View style={[styles.face, { backgroundColor: color, height: h, borderRadius: radius.lg, transform: [{ translateY: pressed ? 4 : 0 }] }]}>
            {icon ? <Ionicons name={icon} size={small ? 20 : 24} color={textColor} style={{ marginRight: space.sm }} /> : null}
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.label, { color: textColor, fontSize: small ? 17 : 21 }]}>{label}</Text>
              {sub}
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

interface IconButtonProps {
  icon: IconName;
  onPress(): void;
  label: string;
  badge?: string | number;
  size?: number;
  disabled?: boolean;
  color?: string;
}

/** 동그란 아이콘 버튼(되돌리기·힌트 등). 아래에 이름. */
export function IconButton({ icon, onPress, label, badge, size = 56, disabled, color = colors.card }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        playSfx('tap');
        buzz('light');
        onPress();
      }}
      style={({ pressed }) => [{ alignItems: 'center', opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] }]}
    >
      <View style={[styles.round, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
        <Ionicons name={icon} size={size * 0.48} color={colors.ink} />
        {badge !== undefined ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.iconLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  edge: { justifyContent: 'flex-start' },
  face: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  label: { fontFamily: FONT.round },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.line,
    borderBottomWidth: 5,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: { color: colors.white, fontFamily: FONT.round, fontSize: 13 },
  iconLabel: { marginTop: 4, color: colors.inkSoft, fontSize: 12, fontFamily: FONT.round },
});
