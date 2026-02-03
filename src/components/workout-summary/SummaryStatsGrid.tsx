import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '../../constants/theme';
import { createSummaryStyles } from './styles';

interface SummaryStatsGridProps {
  duration: number;
  exerciseCount: number;
  setCount: number;
  totalVolume: number;
  xpEarned: number;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
};

const formatVolume = (kg: number): string => {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}K kg`;
  }
  return `${kg.toLocaleString()} kg`;
};

export const SummaryStatsGrid: React.FC<SummaryStatsGridProps> = ({
  duration,
  exerciseCount,
  setCount,
  totalVolume,
  xpEarned,
}) => {
  const { colors } = useTheme();
  const styles = createSummaryStyles(colors);

  return (
    <>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color={colors.teal} />
          <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="barbell-outline" size={24} color={colors.orange} />
          <Text style={styles.statValue}>{exerciseCount}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.green} />
          <Text style={styles.statValue}>{setCount}</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="fitness-outline" size={24} color={colors.purple} />
          <Text style={styles.statValue}>{formatVolume(totalVolume)}</Text>
          <Text style={styles.statLabel}>Volume</Text>
        </View>
      </View>

      {xpEarned > 0 && (
        <View style={styles.xpSection}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.xpBadge}
          >
            <Ionicons name="star" size={20} color={colors.purple} />
            <Text style={styles.xpText}>+{xpEarned} XP</Text>
          </LinearGradient>
        </View>
      )}
    </>
  );
};
