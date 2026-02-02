import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { showAlert } from '../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import type { ProfileScreenProps } from '../navigation/types';
import { UserProfileCard, SettingsMenuItem, XPProgressBar } from '../components';
import { getUserProfile, getLevelInfo, type LevelInfo } from '../services';
import { typography, spacing, borderRadius } from '../constants/theme';
import { useAuth, useTheme, type ThemeMode } from '../contexts';


export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, signOut } = useAuth();
  const { colors, themeMode, setThemeMode } = useTheme();

  // Get user display name from metadata or email
  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Fitness Enthusiast';
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setLevelInfo(getLevelInfo(profile.total_xp));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleAchievements = () => {
    navigation.navigate('AchievementsScreen');
  };

  const handleTheme = () => {
    setShowThemeModal(true);
  };

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    setShowThemeModal(false);
  };

  const getThemeLabel = (mode: ThemeMode): string => {
    switch (mode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
    }
  };

  const handleNotifications = () => {
    showAlert('Notifications', 'Notification settings coming soon!');
  };

  const handlePrivacy = () => {
    navigation.navigate('PrivacyPolicyScreen');
  };

  const handleAccount = () => {
    showAlert('Account', 'Account settings coming soon!');
  };

  const handleExportData = () => {
    navigation.navigate('ExportDataScreen');
  };

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccountScreen');
  };

  const handleAbout = () => {
    showAlert(
      'About LiftArc',
      'LiftArc - Your personal gym workout tracker.\n\nVersion 1.0.0\n\nBuilt with React Native and Expo.'
    );
  };

  const handleSignOut = async () => {
    showAlert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              showAlert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.purple }]} accessibilityRole="header">Profile</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your account</Text>
      </View>

      {/* User Profile Card */}
      <View style={styles.section}>
        <UserProfileCard
          userName={userName}
          memberSince={memberSince}
          gradientColors={colors.gradientPurplePink}
        />
      </View>

      {/* XP Progress */}
      {levelInfo && (
        <View style={styles.section}>
          <XPProgressBar levelInfo={levelInfo} />
        </View>
      )}

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Progress</Text>
        <View style={styles.settingsCard}>
          <SettingsMenuItem
            title="Achievements"
            icon="ribbon"
            onPress={handleAchievements}
            showDivider={false}
          />
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.cardBackground }]}>
          <SettingsMenuItem
            title="Theme"
            icon="color-palette-outline"
            onPress={handleTheme}
            rightText={getThemeLabel(themeMode)}
          />
          <SettingsMenuItem
            title="Notifications"
            icon="notifications"
            onPress={handleNotifications}
          />
          <SettingsMenuItem
            title="Privacy"
            icon="lock-closed"
            onPress={handlePrivacy}
          />
          <SettingsMenuItem
            title="Account"
            icon="person-circle"
            onPress={handleAccount}
          />
          <SettingsMenuItem
            title="Export Data"
            icon="download-outline"
            onPress={handleExportData}
          />
          <SettingsMenuItem
            title="About"
            icon="information-circle"
            onPress={handleAbout}
          />
          <SettingsMenuItem
            title="Sign Out"
            icon="log-out-outline"
            onPress={handleSignOut}
          />
          <SettingsMenuItem
            title="Delete Account"
            icon="trash-outline"
            onPress={handleDeleteAccount}
            showDivider={false}
            textColor="#FF3B30"
            iconColor="#FF3B30"
          />
        </View>
      </View>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowThemeModal(false)}
          accessibilityLabel="Close theme selection modal"
          accessibilityRole="button"
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Theme</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Choose your preferred theme
            </Text>

            <View style={styles.themeOptions}>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeOption,
                    { 
                      backgroundColor: themeMode === mode ? colors.purple + '20' : 'transparent',
                      borderColor: themeMode === mode ? colors.purple : colors.border,
                    }
                  ]}
                  onPress={() => handleSelectTheme(mode)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${getThemeLabel(mode)} theme`}
                  accessibilityState={{ checked: themeMode === mode, selected: themeMode === mode }}
                >
                  <View style={styles.themeOptionLeft}>
                    <Ionicons 
                      name={
                        mode === 'light' ? 'sunny' : 
                        mode === 'dark' ? 'moon' : 
                        'phone-portrait-outline'
                      }
                      size={24}
                      color={themeMode === mode ? colors.purple : colors.textSecondary}
                    />
                    <View style={styles.themeOptionText}>
                      <Text style={[styles.themeOptionTitle, { color: colors.textPrimary }]}>
                        {getThemeLabel(mode)}
                      </Text>
                      <Text style={[styles.themeOptionDesc, { color: colors.textSecondary }]}>
                        {mode === 'system' ? 'Match device settings' : 
                         mode === 'light' ? 'Always use light mode' : 
                         'Always use dark mode'}
                      </Text>
                    </View>
                  </View>
                  {themeMode === mode && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.purple} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.modalCloseButton, { backgroundColor: colors.purple }]}
              onPress={() => setShowThemeModal(false)}
              accessibilityRole="button"
              accessibilityLabel="Done selecting theme"
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.title2,
    marginBottom: spacing.lg,
  },
  settingsCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
  },
  modalTitle: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.body,
    marginBottom: spacing.xxl,
  },
  themeOptions: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  themeOptionText: {
    flex: 1,
  },
  themeOptionTitle: {
    ...typography.headline,
    marginBottom: 2,
  },
  themeOptionDesc: {
    ...typography.caption,
  },
  modalCloseButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
});
