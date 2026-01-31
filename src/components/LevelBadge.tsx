import React from 'react';
import { useTheme } from '../contexts';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, getLevelTier } from '../constants/theme';

interface LevelBadgeProps {
  level: number;
  size?: 'small' | 'medium' | 'large';
  showTier?: boolean;
}

export default function LevelBadge({ level, size = 'medium', showTier = false }: LevelBadgeProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const tier = getLevelTier(level);

  const sizeConfig = {
    small: { badge: 32, fontSize: 14, iconSize: 12 },
    medium: { badge: 48, fontSize: 18, iconSize: 16 },
    large: { badge: 72, fontSize: 28, iconSize: 24 },
  };

  const config = sizeConfig[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            width: config.badge,
            height: config.badge,
            borderRadius: config.badge / 2,
            backgroundColor: tier.color,
          },
        ]}
      >
        <Text style={[styles.levelText, { fontSize: config.fontSize }]}>{level}</Text>
      </View>
      {showTier && (
        <View style={styles.tierContainer}>
          <Ionicons
            name={level >= 100 ? 'diamond' : level >= 50 ? 'star' : 'shield'}
            size={config.iconSize}
            color={tier.color}
          />
          <Text style={[styles.tierText, { color: tier.color }]}>{tier.name}</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  levelText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  tierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tierText: {
    ...typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
