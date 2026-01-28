import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants/theme';

interface SettingsMenuItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showChevron?: boolean;
  showDivider?: boolean;
}

export default function SettingsMenuItem({
  title,
  icon,
  onPress,
  showChevron = true,
  showDivider = true,
}: SettingsMenuItemProps) {
  return (
    <View>
      <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={colors.textPrimary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Chevron */}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        )}
      </TouchableOpacity>

      {/* Divider */}
      {showDivider && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconContainer: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.body,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.xl + 32 + spacing.md, // Align with title text
  },
});
