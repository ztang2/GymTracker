import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TemplateListScreenProps } from '../navigation/types';
import {
  getUserTemplates,
  deleteTemplate,
  type WorkoutTemplate,
} from '../services';
import { LoadingState, EmptyState } from '../components';
import { typography, spacing, borderRadius, shadows, getCategoryColor } from '../constants/theme';
import { useAuth , useTheme } from '../contexts';

// Cross-platform alert helper
type AlertButtonStyle = 'default' | 'cancel' | 'destructive';
type AlertButton = { text: string; style?: AlertButtonStyle; onPress?: () => void };

const showAlert = (
  title: string,
  message: string,
  buttons: AlertButton[]
) => {
  if (Platform.OS === 'web') {
    const confirmButton = buttons.find((b) => b.style !== 'cancel');
    const cancelButton = buttons.find((b) => b.style === 'cancel');

    if (confirmButton && cancelButton) {
      if (window.confirm(`${title}\n\n${message}`)) {
        confirmButton.onPress?.();
      }
    } else if (buttons.length === 1) {
      window.alert(`${title}\n\n${message}`);
      buttons[0].onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};


export default function TemplateListScreen({ navigation }: TemplateListScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    if (!user) return;
    try {
      const data = await getUserTemplates(user?.id);
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
  }, []);

  const handleStartTemplate = (template: WorkoutTemplate) => {
    showAlert(
      'Start Workout',
      `Start workout from "${template.name}" template?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            navigation.navigate('ActiveWorkoutFromTemplateScreen', {
              templateId: template.id,
            });
          },
        },
      ]
    );
  };

  const handleDeleteTemplate = (template: WorkoutTemplate) => {
    showAlert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteTemplate(template.id);
            if (success) {
              setTemplates((prev) => prev.filter((t) => t.id !== template.id));
            } else {
              showAlert('Error', 'Failed to delete template.', [{ text: 'OK' }]);
            }
          },
        },
      ]
    );
  };

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return '';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Workout Templates</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {templates.length === 0 ? (
          <EmptyState
            title="No Templates"
            message="Save a workout as a template to quickly start similar workouts."
            actionLabel="Start Workout"
            onAction={() => navigation.navigate('ActiveWorkoutScreen')}
          />
        ) : (
          templates.map((template) => (
            <View key={template.id} style={styles.templateCard}>
              <TouchableOpacity
                style={styles.templateContent}
                onPress={() => handleStartTemplate(template)}
              >
                <View style={styles.templateHeader}>
                  <View style={styles.templateIcon}>
                    <Ionicons name="document-text" size={24} color={colors.teal} />
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    {template.description && (
                      <Text style={styles.templateDescription} numberOfLines={1}>
                        {template.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteTemplate(template)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>

                {/* Exercise list preview */}
                {template.exercises && template.exercises.length > 0 && (
                  <View style={styles.exercisePreview}>
                    {template.exercises.slice(0, 4).map((te, index) => (
                      <View key={te.id} style={styles.exerciseItem}>
                        <View
                          style={[
                            styles.exerciseDot,
                            { backgroundColor: getCategoryColor(te.exercise?.category || 'chest') },
                          ]}
                        />
                        <Text style={styles.exerciseName} numberOfLines={1}>
                          {te.exercise?.name || 'Exercise'}
                        </Text>
                        <Text style={styles.exerciseSets}>
                          {te.target_sets}×{te.target_reps}
                        </Text>
                      </View>
                    ))}
                    {template.exercises.length > 4 && (
                      <Text style={styles.moreExercises}>
                        +{template.exercises.length - 4} more
                      </Text>
                    )}
                  </View>
                )}

                {/* Footer */}
                <View style={styles.templateFooter}>
                  <View style={styles.metaInfo}>
                    <Ionicons name="barbell" size={14} color={colors.textTertiary} />
                    <Text style={styles.metaText}>
                      {template.exercises?.length || 0} exercises
                    </Text>
                  </View>
                  {template.estimated_duration && (
                    <View style={styles.metaInfo}>
                      <Ionicons name="time" size={14} color={colors.textTertiary} />
                      <Text style={styles.metaText}>
                        {formatDuration(template.estimated_duration)}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Start Button */}
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartTemplate(template)}
              >
                <LinearGradient
                  colors={colors.gradientTealGreen}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startGradient}
                >
                  <Ionicons name="play" size={18} color={colors.textPrimary} />
                  <Text style={styles.startButtonText}>Start</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.title2,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  templateCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  templateContent: {
    padding: spacing.lg,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  templateDescription: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  exercisePreview: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exerciseName: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  exerciseSets: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  moreExercises: {
    ...typography.caption,
    color: colors.teal,
    marginTop: spacing.xs,
  },
  templateFooter: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  startButton: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  startButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
  },
});
