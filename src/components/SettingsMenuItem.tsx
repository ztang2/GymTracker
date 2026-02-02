import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing } from '../constants/theme';
import { useTheme } from '../contexts';

interface SettingsMenuItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showChevron?: boolean;
  showDivider?: boolean;
  rightText?: string;
}

export default function SettingsMenuItem({
  title,
  icon,
  onPress,
  showChevron = true,
  showDivider = true,
  rightText,
}: SettingsMenuItemProps) {
  const { colors } = useTheme();
  
  return (
    <View>
      <TouchableOpacity 
        onPress={onPress} 
        style={styles.container} 
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${title}${rightText ? `, ${rightText}` : ''}`}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={colors.textPrimary} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

        {/* Right Text */}
        {rightText && (
          <Text style={[styles.rightText, { color: colors.textTertiary }]}>{rightText}</Text>
        )}

        {/* Chevron */}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        )}
      </TouchableOpacity>

      {/* Divider */}
      {showDivider && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
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
  rightText: {
    ...typography.callout,
    marginRight: spacing.xs,
  },
  divider: {
    height: 1,
    marginLeft: spacing.xl + 32 + spacing.md, // Align with title text
  },
});
