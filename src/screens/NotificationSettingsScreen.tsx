import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '../utils/alert';
import { typography, spacing, borderRadius } from '../constants/theme';
import { useTheme } from '../contexts';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestNotificationPermissions,
  hasNotificationPermissions,
  DAY_LABELS,
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPreferences,
} from '../services/notificationService';
import type { NotificationSettingsScreenProps } from '../navigation/types';

export default function NotificationSettingsScreen({
  navigation,
}: NotificationSettingsScreenProps) {
  const { colors } = useTheme();

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFS);
  const [loading, setLoading] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const stored = await getNotificationPreferences();
    setPrefs(stored);
    setLoading(false);
  };

  const save = useCallback(
    async (updated: NotificationPreferences) => {
      setPrefs(updated);
      await saveNotificationPreferences(updated);
    },
    []
  );

  const handleToggleEnabled = async (value: boolean) => {
    if (value) {
      const hasPerms = await hasNotificationPermissions();
      if (!hasPerms) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          showAlert(
            'Permissions Required',
            'Please enable notifications in your device settings to receive workout reminders.'
          );
          return;
        }
      }
    }
    save({ ...prefs, enabled: value });
  };

  const handleToggleDay = (weekday: number) => {
    const days = prefs.days.includes(weekday)
      ? prefs.days.filter((d) => d !== weekday)
      : [...prefs.days, weekday].sort((a, b) => a - b);
    save({ ...prefs, days });
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedDate) {
      save({
        ...prefs,
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes(),
      });
    }
  };

  const timeDate = new Date();
  timeDate.setHours(prefs.hour, prefs.minute, 0, 0);

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={28} color={colors.purple} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.purple }]}>
            Workout Reminders
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Never miss a training day
          </Text>
        </View>
      </View>

      {/* Enable / Disable */}
      <View
        style={[styles.card, { backgroundColor: colors.cardBackground }]}
      >
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.purple}
            />
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
              Enable Reminders
            </Text>
          </View>
          <Switch
            value={prefs.enabled}
            onValueChange={handleToggleEnabled}
            trackColor={{ false: colors.border, true: colors.purple + '80' }}
            thumbColor={prefs.enabled ? colors.purple : colors.textTertiary}
          />
        </View>
      </View>

      {/* Day Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Workout Days
        </Text>
        <View style={styles.daysRow}>
          {DAY_LABELS.map((day) => {
            const selected = prefs.days.includes(day.weekday);
            return (
              <TouchableOpacity
                key={day.weekday}
                onPress={() => handleToggleDay(day.weekday)}
                disabled={!prefs.enabled}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: selected
                      ? colors.purple
                      : colors.cardBackground,
                    borderColor: selected ? colors.purple : colors.border,
                    opacity: prefs.enabled ? 1 : 0.4,
                  },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={day.full}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    {
                      color: selected ? '#FFFFFF' : colors.textSecondary,
                    },
                  ]}
                >
                  {day.short}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Time Picker */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Reminder Time
        </Text>
        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          disabled={!prefs.enabled}
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBackground,
              opacity: prefs.enabled ? 1 : 0.4,
            },
          ]}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="time-outline"
                size={22}
                color={colors.purple}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Time
              </Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              {formatTime(prefs.hour, prefs.minute)}
            </Text>
          </View>
        </TouchableOpacity>

        {showTimePicker && (
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={timeDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              themeVariant="dark"
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.doneButton, { backgroundColor: colors.purple }]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Summary */}
      {prefs.enabled && prefs.days.length > 0 && (
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.purple + '15' },
          ]}
        >
          <Ionicons name="information-circle-outline" size={20} color={colors.purple} />
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            You'll be reminded at{' '}
            <Text style={{ color: colors.purple, fontWeight: '600' }}>
              {formatTime(prefs.hour, prefs.minute)}
            </Text>{' '}
            on{' '}
            <Text style={{ color: colors.purple, fontWeight: '600' }}>
              {prefs.days
                .map((d) => DAY_LABELS.find((l) => l.weekday === d)?.short)
                .join(', ')}
            </Text>
            .
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl * 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  title: {
    ...typography.largeTitle,
    fontSize: 28,
  },
  subtitle: {
    ...typography.body,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  card: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.headline,
  },
  rowValue: {
    ...typography.body,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dayChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  dayChipText: {
    ...typography.caption,
    fontWeight: '600',
  },
  pickerWrapper: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  doneButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  doneButtonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  summaryCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  summaryText: {
    ...typography.callout,
    flex: 1,
    lineHeight: 20,
  },
});
