import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { showAlert } from '../utils/alert';
import type { StackScreenProps } from '@react-navigation/stack';
import type { ProfileStackParamList } from '../navigation/types';
import { exportUserData, formatAsCSV, type ExportData } from '../services';
import { typography, spacing, borderRadius, type ThemeColors } from '../constants/theme';
import { useAuth, useTheme } from '../contexts';

type ExportDataScreenProps = StackScreenProps<ProfileStackParamList, 'ExportDataScreen'>;

export default function ExportDataScreen({ navigation }: ExportDataScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [dataStats, setDataStats] = useState<ExportData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadDataPreview();
  }, []);

  const loadDataPreview = async () => {
    if (!user) return;

    setIsLoading(true);
    const data = await exportUserData(user.id);
    setDataStats(data);
    setIsLoading(false);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    if (Platform.OS === 'web') {
      // Web: Create blob and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Mobile: Use expo-sharing
      shareFile(content, filename);
    }
  };

  const shareFile = async (content: string, filename: string) => {
    try {
      const file = new File(Paths.cache, filename);
      await file.write(content);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri);
      } else {
        showAlert('Success', `Data exported to: ${file.uri}`);
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      showAlert('Error', 'Failed to share file. Please try again.');
    }
  };

  const handleExportJSON = async () => {
    if (!dataStats || !user) return;

    setIsExporting(true);

    try {
      const jsonContent = JSON.stringify(dataStats, null, 2);
      const filename = `liftarc-data-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(jsonContent, filename, 'application/json');
      
      showAlert('Success', 'Your data has been exported as JSON!');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      showAlert('Error', 'Failed to export data. Please try again.');
    }

    setIsExporting(false);
  };

  const handleExportCSV = async () => {
    if (!dataStats || !user) return;

    setIsExporting(true);

    try {
      const csvContent = formatAsCSV(dataStats);
      const filename = `liftarc-workouts-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvContent, filename, 'text/csv');
      
      showAlert('Success', 'Your workout data has been exported as CSV!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showAlert('Error', 'Failed to export data. Please try again.');
    }

    setIsExporting(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Export Data</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading your data...
            </Text>
          </View>
        ) : (
          <>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: colors.purple + '20' }]}>
              <Ionicons name="download" size={60} color={colors.purple} />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Export Your Data
            </Text>

            {/* Description */}
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Download a complete copy of your workout data. Choose your preferred format below.
            </Text>

            {/* Data Stats */}
            {dataStats && (
              <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>
                  Your Data Summary
                </Text>
                <View style={styles.statsGrid}>
                  <StatItem 
                    label="Workouts" 
                    value={dataStats.total_workouts.toString()} 
                    icon="barbell"
                    colors={colors}
                  />
                  <StatItem 
                    label="Exercises" 
                    value={dataStats.total_exercises.toString()} 
                    icon="fitness"
                    colors={colors}
                  />
                  <StatItem 
                    label="Sets" 
                    value={dataStats.total_sets.toString()} 
                    icon="analytics"
                    colors={colors}
                  />
                  <StatItem 
                    label="Goals" 
                    value={dataStats.user_goals.length.toString()} 
                    icon="trophy"
                    colors={colors}
                  />
                  <StatItem 
                    label="PRs" 
                    value={dataStats.personal_records.length.toString()} 
                    icon="trending-up"
                    colors={colors}
                  />
                  <StatItem 
                    label="Templates" 
                    value={dataStats.workout_templates.length.toString()} 
                    icon="document-text"
                    colors={colors}
                  />
                </View>
              </View>
            )}

            {/* Export Options */}
            <View style={styles.exportOptions}>
              <Text style={[styles.optionsTitle, { color: colors.textPrimary }]}>
                Export Format
              </Text>

              {/* JSON Export */}
              <TouchableOpacity
                style={[styles.exportButton, { backgroundColor: colors.cardBackground, borderColor: colors.purple }]}
                onPress={handleExportJSON}
                disabled={isExporting}
                accessibilityRole="button"
                accessibilityLabel="Export as JSON"
              >
                <View style={styles.exportButtonLeft}>
                  <View style={[styles.exportIconContainer, { backgroundColor: colors.purple + '20' }]}>
                    <Ionicons name="code-working" size={24} color={colors.purple} />
                  </View>
                  <View style={styles.exportTextContainer}>
                    <Text style={[styles.exportButtonTitle, { color: colors.textPrimary }]}>
                      JSON Format
                    </Text>
                    <Text style={[styles.exportButtonDesc, { color: colors.textSecondary }]}>
                      Complete data export with all fields
                    </Text>
                  </View>
                </View>
                <Ionicons name="download-outline" size={24} color={colors.purple} />
              </TouchableOpacity>

              {/* CSV Export */}
              <TouchableOpacity
                style={[styles.exportButton, { backgroundColor: colors.cardBackground, borderColor: colors.purple }]}
                onPress={handleExportCSV}
                disabled={isExporting}
                accessibilityRole="button"
                accessibilityLabel="Export as CSV"
              >
                <View style={styles.exportButtonLeft}>
                  <View style={[styles.exportIconContainer, { backgroundColor: colors.purple + '20' }]}>
                    <Ionicons name="document-text" size={24} color={colors.purple} />
                  </View>
                  <View style={styles.exportTextContainer}>
                    <Text style={[styles.exportButtonTitle, { color: colors.textPrimary }]}>
                      CSV Format
                    </Text>
                    <Text style={[styles.exportButtonDesc, { color: colors.textSecondary }]}>
                      Workout logs for spreadsheet apps
                    </Text>
                  </View>
                </View>
                <Ionicons name="download-outline" size={24} color={colors.purple} />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={[styles.infoBox, { backgroundColor: colors.purple + '10', borderColor: colors.purple + '30' }]}>
              <Ionicons name="information-circle" size={20} color={colors.purple} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Your data will be downloaded to your device. You can import it into spreadsheet apps or keep it as a backup.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: ThemeColors;
}

function StatItem({ label, value, icon, colors }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={20} color={colors.purple} />
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xxl,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...typography.title2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl * 3,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.largeTitle,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  statsCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  statsTitle: {
    ...typography.title2,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    ...typography.title,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  exportOptions: {
    marginBottom: spacing.xxl,
  },
  optionsTitle: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  exportButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  exportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportTextContainer: {
    flex: 1,
  },
  exportButtonTitle: {
    ...typography.headline,
    marginBottom: 2,
  },
  exportButtonDesc: {
    ...typography.caption,
  },
  infoBox: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  infoText: {
    ...typography.caption,
    flex: 1,
  },
});
