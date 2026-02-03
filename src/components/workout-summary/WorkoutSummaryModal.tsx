import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../contexts';
import { View, Text, Modal, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { buildShareTextFromSummary, shareWorkoutText } from '../../utils/shareWorkout';
import type { WorkoutSummary } from '../../services/types';
import { CelebrationAnimation } from './CelebrationAnimation';
import { SummaryStatsGrid } from './SummaryStatsGrid';
import { ExerciseResultList } from './ExerciseResultList';
import { SummaryActionButtons } from './SummaryActionButtons';
import { createSummaryStyles } from './styles';

interface WorkoutSummaryModalProps {
  visible: boolean;
  summary: WorkoutSummary | null;
  onClose: () => void;
  onSaveAsTemplate?: () => void;
}

export default function WorkoutSummaryModal({
  visible,
  summary,
  onClose,
  onSaveAsTemplate,
}: WorkoutSummaryModalProps) {
  const { colors } = useTheme();
  const styles = createSummaryStyles(colors);
  if (!summary) return null;

  const handleShare = () => {
    const text = buildShareTextFromSummary(summary);
    shareWorkoutText(text);
  };

  // Container scale-up entrance animation
  const containerScale = useRef(new Animated.Value(0.9)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      containerScale.setValue(0.9);
      containerOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(containerScale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay} accessible={false}>
        <Animated.View style={[styles.container, { opacity: containerOpacity, transform: [{ scale: containerScale }] }]}>
          {/* Header with gradient */}
          <LinearGradient
            colors={colors.gradientPurplePink}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.celebrationIcon}>
              <CelebrationAnimation visible={visible} />
              <Ionicons name="trophy" size={48} color={colors.textPrimary} />
            </View>
            <Text style={styles.title}>Workout Complete!</Text>
            <Text style={styles.subtitle}>Great job crushing it today</Text>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <SummaryStatsGrid
              duration={summary.duration}
              exerciseCount={summary.exerciseCount}
              setCount={summary.setCount}
              totalVolume={summary.totalVolume}
              xpEarned={summary.xpEarned}
            />
            <ExerciseResultList
              newPRs={summary.newPRs}
              newBadges={summary.newBadges}
            />
          </ScrollView>

          <SummaryActionButtons
            onShare={handleShare}
            onSaveAsTemplate={onSaveAsTemplate}
            onClose={onClose}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}
