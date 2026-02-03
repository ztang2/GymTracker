import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts';
import { Ionicons } from '@expo/vector-icons';
import type { PRDetectionResult, Badge } from '../../services/types';
import { createSummaryStyles } from './styles';

interface ExerciseResultListProps {
  newPRs: PRDetectionResult[];
  newBadges: Badge[];
}

export const ExerciseResultList: React.FC<ExerciseResultListProps> = ({
  newPRs,
  newBadges,
}) => {
  const { colors } = useTheme();
  const styles = createSummaryStyles(colors);

  const hasNewPRs = newPRs.length > 0;
  const hasNewBadges = newBadges.length > 0;

  return (
    <>
      {/* New PRs Section */}
      {hasNewPRs && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.sectionTitle}>New Personal Records!</Text>
          </View>
          {newPRs.map((pr, index) => (
            <View key={index} style={styles.prItem}>
              <Text style={styles.prExercise}>{pr.exerciseName}</Text>
              <View style={styles.prDetails}>
                <Text style={styles.prValue}>
                  {pr.recordType === 'max_weight'
                    ? `${pr.newValue} kg`
                    : pr.recordType === 'max_reps'
                    ? `${pr.newValue} reps`
                    : `${pr.newValue.toFixed(1)} kg (1RM)`}
                </Text>
                {pr.improvement && (
                  <Text style={styles.prImprovement}>
                    +{pr.improvement.toFixed(1)}%
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* New Badges Section */}
      {hasNewBadges && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ribbon" size={20} color={colors.orange} />
            <Text style={styles.sectionTitle}>Badges Unlocked!</Text>
          </View>
          {newBadges.map((badge, index) => (
            <View key={index} style={styles.badgeItem}>
              <View style={styles.badgeIcon}>
                <Ionicons
                  name={badge.icon_name as any}
                  size={24}
                  color={colors.textPrimary}
                />
              </View>
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
              </View>
              <Text style={styles.badgeXP}>+{badge.xp_reward} XP</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
};
