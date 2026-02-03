import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, prColors ,  type ThemeColors } from '../constants/theme';

interface PRBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function PRBadge({ size = 'medium', showLabel = true }: PRBadgeProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const sizeConfig = {
    small: { badge: 20, icon: 12, font: 10 },
    medium: { badge: 28, icon: 16, font: 12 },
    large: { badge: 40, icon: 24, font: 14 },
  };

  const config = sizeConfig[size];

  return (
    <View style={styles.container} accessibilityLabel="Personal record badge">
      <View
        style={[
          styles.badge,
          {
            width: config.badge,
            height: config.badge,
            borderRadius: config.badge / 2,
          },
        ]}
      >
        <Ionicons name="trophy" size={config.icon} color={prColors.gold} />
      </View>
      {showLabel && (
        <Text style={[styles.label, { fontSize: config.font }]}>PR</Text>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: prColors.gold,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
