import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GoalSettingScreenProps } from '../navigation/types';
import type { GoalType, GoalPeriod, GoalProgress, UserGoal } from '../services/types';
import {
  getActiveGoals,
  createGoal,
  deleteGoal,
  calculateAllGoalProgress,
  getGoalSuggestions,
  GOAL_TYPE_LABELS,
  GOAL_PERIOD_LABELS,
  GOAL_TYPE_ICONS,
} from '../services/goalService';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { ProgressBar, LoadingState } from '../components';

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

const USER_ID = 'test-user-123';

// Goal type configurations
const GOAL_CONFIGS: Array<{
  type: GoalType;
  periods: GoalPeriod[];
  defaultValues: { weekly: number; monthly: number };
  unit: string;
  minValue: number;
  maxValue: number;
}> = [
  {
    type: 'workout_days',
    periods: ['weekly', 'monthly'],
    defaultValues: { weekly: 4, monthly: 16 },
    unit: 'days',
    minValue: 1,
    maxValue: 31,
  },
  {
    type: 'total_workouts',
    periods: ['weekly', 'monthly'],
    defaultValues: { weekly: 5, monthly: 20 },
    unit: 'workouts',
    minValue: 1,
    maxValue: 100,
  },
  {
    type: 'total_volume',
    periods: ['weekly', 'monthly'],
    defaultValues: { weekly: 5000, monthly: 20000 },
    unit: 'kg',
    minValue: 100,
    maxValue: 500000,
  },
  {
    type: 'streak_days',
    periods: ['weekly'],
    defaultValues: { weekly: 7, monthly: 30 },
    unit: 'days',
    minValue: 1,
    maxValue: 365,
  },
];

export default function GoalSettingScreen({ navigation }: GoalSettingScreenProps) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGoals, setActiveGoals] = useState<UserGoal[]>([]);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [suggestions, setSuggestions] = useState<
    Array<{
      goalType: GoalType;
      periodType: GoalPeriod;
      suggestedValue: number;
      description: string;
    }>
  >([]);

  // Form state for creating new goals
  const [selectedType, setSelectedType] = useState<GoalType>('workout_days');
  const [selectedPeriod, setSelectedPeriod] = useState<GoalPeriod>('weekly');
  const [targetValue, setTargetValue] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goals, progress, goalSuggestions] = await Promise.all([
        getActiveGoals(USER_ID),
        calculateAllGoalProgress(USER_ID),
        getGoalSuggestions(USER_ID),
      ]);
      setActiveGoals(goals);
      setGoalProgress(progress);
      setSuggestions(goalSuggestions);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    const value = parseInt(targetValue, 10);
    if (!value || value <= 0) {
      showAlert('Invalid Value', 'Please enter a valid target value.', [{ text: 'OK' }]);
      return;
    }

    setSaving(true);
    try {
      const newGoal = await createGoal(USER_ID, selectedType, value, selectedPeriod);
      if (newGoal) {
        setShowCreateForm(false);
        setTargetValue('');
        await loadData();
        showAlert('Goal Created', 'Your new goal has been created!', [{ text: 'OK' }]);
      } else {
        showAlert('Error', 'Failed to create goal. Please try again.', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      showAlert('Error', 'Failed to create goal. Please try again.', [{ text: 'OK' }]);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    showAlert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteGoal(goalId);
            if (success) {
              await loadData();
            } else {
              showAlert('Error', 'Failed to delete goal.', [{ text: 'OK' }]);
            }
          },
        },
      ]
    );
  };

  const handleSuggestionPress = (suggestion: typeof suggestions[0]) => {
    setSelectedType(suggestion.goalType);
    setSelectedPeriod(suggestion.periodType);
    setTargetValue(suggestion.suggestedValue.toString());
    setShowCreateForm(true);
  };

  const getConfig = (type: GoalType) => GOAL_CONFIGS.find(c => c.type === type);

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
        <Text style={styles.title}>Set Goals</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Current Goals Section */}
        {goalProgress.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Goals</Text>
            {goalProgress.map((progress) => (
              <View key={progress.goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalIcon}>
                    <Ionicons
                      name={GOAL_TYPE_ICONS[progress.goal.goal_type] as any}
                      size={24}
                      color={colors.textPrimary}
                    />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>
                      {GOAL_TYPE_LABELS[progress.goal.goal_type]}
                    </Text>
                    <Text style={styles.goalPeriod}>
                      {GOAL_PERIOD_LABELS[progress.goal.period_type]}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteGoal(progress.goal.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressStats}>
                    <Text style={styles.progressValue}>
                      {progress.currentValue.toLocaleString()}
                    </Text>
                    <Text style={styles.progressTarget}>
                      / {progress.goal.target_value.toLocaleString()}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={progress.progress}
                    height={8}
                    gradientColors={
                      progress.isComplete
                        ? colors.gradientTealGreen
                        : colors.gradientPurplePink
                    }
                  />
                  {progress.isComplete && (
                    <View style={styles.completeBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.green} />
                      <Text style={styles.completeText}>Goal Complete!</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Suggestions Section */}
        {suggestions.length > 0 && !showCreateForm && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Goals</Text>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionCard}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <View style={styles.suggestionIcon}>
                  <Ionicons
                    name={GOAL_TYPE_ICONS[suggestion.goalType] as any}
                    size={20}
                    color={colors.teal}
                  />
                </View>
                <View style={styles.suggestionInfo}>
                  <Text style={styles.suggestionText}>{suggestion.description}</Text>
                  <Text style={styles.suggestionPeriod}>
                    {GOAL_PERIOD_LABELS[suggestion.periodType]}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color={colors.teal} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Create Goal Form */}
        {showCreateForm ? (
          <View style={styles.section}>
            <View style={styles.formHeader}>
              <Text style={styles.sectionTitle}>Create New Goal</Text>
              <TouchableOpacity onPress={() => setShowCreateForm(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Goal Type Selection */}
            <Text style={styles.fieldLabel}>Goal Type</Text>
            <View style={styles.optionsGrid}>
              {GOAL_CONFIGS.map((config) => (
                <TouchableOpacity
                  key={config.type}
                  style={[
                    styles.optionButton,
                    selectedType === config.type && styles.optionButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedType(config.type);
                    setTargetValue(config.defaultValues[selectedPeriod].toString());
                  }}
                >
                  <Ionicons
                    name={GOAL_TYPE_ICONS[config.type] as any}
                    size={20}
                    color={selectedType === config.type ? colors.textPrimary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedType === config.type && styles.optionTextActive,
                    ]}
                  >
                    {GOAL_TYPE_LABELS[config.type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Period Selection */}
            <Text style={styles.fieldLabel}>Period</Text>
            <View style={styles.periodRow}>
              {(['weekly', 'monthly'] as GoalPeriod[]).map((period) => {
                const config = getConfig(selectedType);
                const isDisabled = config && !config.periods.includes(period);
                return (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      selectedPeriod === period && styles.periodButtonActive,
                      isDisabled && styles.periodButtonDisabled,
                    ]}
                    onPress={() => {
                      if (!isDisabled) {
                        setSelectedPeriod(period);
                        if (config) {
                          setTargetValue(config.defaultValues[period].toString());
                        }
                      }
                    }}
                    disabled={isDisabled}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        selectedPeriod === period && styles.periodTextActive,
                        isDisabled && styles.periodTextDisabled,
                      ]}
                    >
                      {GOAL_PERIOD_LABELS[period]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Target Value */}
            <Text style={styles.fieldLabel}>Target</Text>
            <View style={styles.valueInputContainer}>
              <TextInput
                style={styles.valueInput}
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
                placeholder="Enter target"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.unitText}>
                {getConfig(selectedType)?.unit || ''}
              </Text>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, saving && styles.createButtonDisabled]}
              onPress={handleCreateGoal}
              disabled={saving}
            >
              <LinearGradient
                colors={colors.gradientTealGreen}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createGradient}
              >
                <Text style={styles.createButtonText}>
                  {saving ? 'Creating...' : 'Create Goal'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addGoalButton}
            onPress={() => setShowCreateForm(true)}
          >
            <Ionicons name="add" size={24} color={colors.teal} />
            <Text style={styles.addGoalText}>Create Custom Goal</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.lg,
  },
  // Goal Card
  goalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  goalPeriod: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  progressSection: {
    gap: spacing.sm,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressValue: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  progressTarget: {
    ...typography.body,
    color: colors.textTertiary,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  completeText: {
    ...typography.caption,
    color: colors.green,
  },
  // Suggestion Card
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  suggestionPeriod: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  // Form
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cancelText: {
    ...typography.body,
    color: colors.teal,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  optionButtonActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  optionText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.textPrimary,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  periodButtonDisabled: {
    opacity: 0.5,
  },
  periodText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.textPrimary,
  },
  periodTextDisabled: {
    color: colors.textMuted,
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  valueInput: {
    flex: 1,
    ...typography.title2,
    color: colors.textPrimary,
    paddingVertical: spacing.lg,
  },
  unitText: {
    ...typography.body,
    color: colors.textTertiary,
  },
  createButton: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  createButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  addGoalText: {
    ...typography.headline,
    color: colors.teal,
  },
});
